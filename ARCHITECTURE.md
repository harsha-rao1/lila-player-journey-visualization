# ARCHITECTURE

## What Was Built and Why

The solution is a two-stage full-stack workflow: (1) Python preprocessing converts raw parquet telemetry into browser-ready JSON, and (2) a React + Vite frontend renders replayable player journeys on minimap canvases. This stack was chosen to optimize execution speed and clarity: Python is strong for parquet and schema handling, while React + Konva is well-suited for interactive, layered map visualization with timeline playback and filters. Tailwind CSS supports fast, consistent dark-theme UI development, and Vercel is a simple static deployment target for the frontend.

## Data Flow (Text Diagram)

`Raw parquet files (5 day folders)`  
`-> preprocess.py (decode bytes, map world coords to minimap px/py, group by match)`  
`-> frontend/public/data/{match_id}.json + index.json`  
`-> React app fetches index.json`  
`-> user selects map/date/match`  
`-> React fetches match JSON`  
`-> Konva draws minimap, paths, markers`  
`-> timeline/filter state drives incremental rendering`  
`-> heatmap.js overlay visualizes kills/deaths/traffic density`

## Coordinate Mapping Approach (Critical Logic)

Coordinates are mapped exactly per provided formula, per map configuration:

- `u = (x - origin_x) / scale`
- `v = (z - origin_z) / scale`
- `pixel_x = u * 1024`
- `pixel_y = (1 - v) * 1024` (Y-axis flip applied)

Map constants used:

- `AmbroseValley`: `scale=900`, `origin_x=-370`, `origin_z=-473`
- `GrandRift`: `scale=581`, `origin_x=-290`, `origin_z=-290`
- `Lockdown`: `scale=1000`, `origin_x=-500`, `origin_z=-500`

The preprocessing stage writes `px/py` in 1024-space. Frontend scales this to an 800x800 canvas (`px * 800/1024`, `py * 800/1024`) so rendering remains map-accurate while fitting UI layout constraints.

## Assumptions Made

1. Filenames with pattern `{user_id}_{match_id}.nakama-0` are treated as parquet regardless of missing extension, as long as `pandas.read_parquet` succeeds.
2. `ts` values are treated as millisecond timeline values from telemetry; if parsed as timestamps by pandas, they are converted to epoch ms consistently.
3. Some events can include both `Position` and `BotPosition`; traffic heatmap includes both to represent total movement density.
4. Hidden files (starting with `.`) and unreadable/non-parquet files are skipped safely.

## Tradeoffs

| Decision | Option Chosen | Alternative | Why Chosen | Tradeoff |
|---|---|---|---|---|
| Precompute px/py in backend | Yes | Compute in frontend | Keeps frontend simple and deterministic | Larger JSON payloads |
| JSON per match in `public` | Static files | API server | Fast local/dev/deploy path, no backend runtime | Less dynamic querying |
| 2MB cap with downsampling | Keep every 3rd Position | No cap / heavier compression | Fast load for large matches | Slightly reduced path fidelity |
| Konva canvas rendering | `react-konva` | SVG/DOM overlays | Better performance for dense paths/events | More rendering-layer code |
| Heatmap via separate overlay | `heatmap.js` absolute layer | Custom Konva heat bins | Quick, proven density rendering | Less control over shader-like effects |

## Three Things Learned from Data

1. **Movement volume is very high** (`Position + BotPosition` dominates event volume), validating the need for timeline and heatmap tools.
2. **Storm deaths are relatively rare** compared to combat deaths, but still spatially cluster enough to identify problematic edge/rotation zones.
3. **Large dead-zone areas exist on all maps** (substantial low/zero-traffic grid coverage), indicating opportunities for route, loot, or objective rebalancing.
