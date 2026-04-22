import json
from collections import OrderedDict
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd


MAP_CONFIGS = {
    "AmbroseValley": {"scale": 900.0, "origin_x": -370.0, "origin_z": -473.0},
    "GrandRift": {"scale": 581.0, "origin_x": -290.0, "origin_z": -290.0},
    "Lockdown": {"scale": 1000.0, "origin_x": -500.0, "origin_z": -500.0},
}

DATE_FOLDERS = [
    "February_10",
    "February_11",
    "February_12",
    "February_13",
    "February_14",
]

MAX_MATCH_JSON_BYTES = 2 * 1024 * 1024


def is_hidden(path: Path) -> bool:
    return path.name.startswith(".")


def is_bot_user(user_id: str) -> bool:
    return user_id.isdigit()


def parse_file_name(file_name: str) -> Tuple[str, str]:
    if "_" not in file_name or not file_name.endswith(".nakama-0"):
        raise ValueError(f"Unexpected file name format: {file_name}")
    user_id, raw_match_id = file_name.split("_", 1)
    display_match_id = raw_match_id.removesuffix(".nakama-0")
    if not display_match_id:
        raise ValueError(f"Unexpected file name format: {file_name}")
    return user_id, display_match_id


def decode_event(value) -> str:
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return str(value)


def to_epoch_ms(value) -> int:
    if pd.isna(value):
        return 0
    if isinstance(value, pd.Timestamp):
        return int(value.value // 1_000_000)
    if isinstance(value, (int, float)):
        return int(value)
    ts = pd.to_datetime(value, errors="coerce")
    if pd.isna(ts):
        return 0
    return int(ts.value // 1_000_000)


def world_to_pixel(map_id: str, x: float, z: float) -> Tuple[float, float]:
    cfg = MAP_CONFIGS[map_id]
    u = (x - cfg["origin_x"]) / cfg["scale"]
    v = (z - cfg["origin_z"]) / cfg["scale"]
    pixel_x = u * 1024.0
    pixel_y = (1.0 - v) * 1024.0
    return pixel_x, pixel_y


def build_match_json_bytes(match_payload: Dict) -> bytes:
    return json.dumps(match_payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def downsample_position_events(match_payload: Dict) -> None:
    for player_payload in match_payload["players"].values():
        pos_counter = 0
        downsampled_events: List[Dict] = []
        for event in player_payload["events"]:
            if event["event"] == "Position":
                if pos_counter % 3 == 0:
                    downsampled_events.append(event)
                pos_counter += 1
            else:
                downsampled_events.append(event)
        player_payload["events"] = downsampled_events


def process_all() -> None:
    script_dir = Path(__file__).resolve().parent
    data_root = script_dir / "player_data"
    output_dir = script_dir / "frontend" / "public" / "data"
    output_dir.mkdir(parents=True, exist_ok=True)

    if not data_root.exists():
        raise FileNotFoundError(f"Data folder not found: {data_root}")

    matches: Dict[str, Dict] = {}
    index_rows: Dict[str, Dict] = {}

    all_files: List[Tuple[str, Path]] = []
    for date_folder in DATE_FOLDERS:
        date_path = data_root / date_folder
        if not date_path.exists():
            print(f"[WARN] Missing date folder, skipping: {date_path}")
            continue
        for file_path in sorted(date_path.iterdir()):
            if file_path.is_dir() or is_hidden(file_path):
                continue
            all_files.append((date_folder, file_path))

    total_files = len(all_files)
    print(f"Discovered {total_files} candidate files across {len(DATE_FOLDERS)} day folders.")

    processed = 0
    skipped = 0
    for date_folder, file_path in all_files:
        try:
            user_id, match_id = parse_file_name(file_path.name)
        except ValueError:
            skipped += 1
            print(f"[SKIP] {file_path.name} (invalid naming format)")
            continue

        try:
            df = pd.read_parquet(file_path)
        except Exception as exc:
            skipped += 1
            print(f"[SKIP] {file_path.name} (not readable parquet): {exc}")
            continue

        if df.empty:
            skipped += 1
            print(f"[SKIP] {file_path.name} (empty parquet)")
            continue

        required_cols = {"map_id", "x", "z", "ts", "event"}
        if not required_cols.issubset(df.columns):
            skipped += 1
            print(f"[SKIP] {file_path.name} (missing required columns)")
            continue

        map_id = str(df["map_id"].dropna().iloc[0]) if not df["map_id"].dropna().empty else ""
        if map_id not in MAP_CONFIGS:
            skipped += 1
            print(f"[SKIP] {file_path.name} (unknown map_id: {map_id})")
            continue

        match_payload = matches.get(match_id)
        if match_payload is None:
            match_payload = {
                "match_id": match_id,
                "map_id": map_id,
                "date": date_folder,
                "players": OrderedDict(),
            }
            matches[match_id] = match_payload
            index_rows[match_id] = {
                "match_id": match_id,
                "map_id": map_id,
                "date": date_folder,
                "player_count": 0,
                "bot_count": 0,
            }

        players = match_payload["players"]
        if user_id not in players:
            players[user_id] = {"is_bot": is_bot_user(user_id), "events": []}
            if players[user_id]["is_bot"]:
                index_rows[match_id]["bot_count"] += 1
            else:
                index_rows[match_id]["player_count"] += 1

        player_events = players[user_id]["events"]

        for row in df.itertuples(index=False):
            event_name = decode_event(row.event)
            px, py = world_to_pixel(map_id, float(row.x), float(row.z))
            player_events.append(
                {
                    "ts": to_epoch_ms(row.ts),
                    "event": event_name,
                    "px": round(px, 2),
                    "py": round(py, 2),
                }
            )

        player_events.sort(key=lambda item: item["ts"])
        processed += 1
        if processed % 50 == 0 or processed == total_files:
            print(f"Processed {processed}/{total_files} files...")

    print(f"Finished file scan. Processed={processed}, Skipped={skipped}, Matches={len(matches)}")

    for match_id, match_payload in matches.items():
        raw_bytes = build_match_json_bytes(match_payload)
        if len(raw_bytes) > MAX_MATCH_JSON_BYTES:
            print(
                f"[INFO] Match {match_id} exceeds 2MB ({len(raw_bytes)} bytes). "
                "Downsampling Position events (every 3rd)."
            )
            downsample_position_events(match_payload)
            raw_bytes = build_match_json_bytes(match_payload)

        output_path = output_dir / f"{match_id}.json"
        output_path.write_bytes(raw_bytes)

    index_list = list(index_rows.values())
    index_list.sort(key=lambda row: (row["date"], row["map_id"], row["match_id"]))
    index_path = output_dir / "index.json"
    index_path.write_text(json.dumps(index_list, indent=2), encoding="utf-8")

    print(f"Wrote {len(matches)} match JSON files to: {output_dir}")
    print(f"Wrote index file: {index_path}")
    print("Preprocessing completed successfully.")


if __name__ == "__main__":
    process_all()
