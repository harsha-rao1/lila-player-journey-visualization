import { useMemo, useState } from "react";
import { Circle, Image as KonvaImage, Layer, Line, Stage } from "react-konva";
import useImage from "use-image";
import {
  CANVAS_SIZE,
  EVENT_COLORS,
  EVENT_TYPES,
  colorFromUserId,
  scaleFromDataToCanvas,
} from "../utils/coordinates";
import Heatmap from "./Heatmap";

function MapCanvas({
  imageSrc,
  matchData,
  currentTs,
  showBots,
  eventFilter,
  heatmapMode,
}) {
  const [mapImage] = useImage(imageSrc);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const { pathLines, markers, heatmapPoints } = useMemo(() => {
    if (!matchData) {
      return { pathLines: [], markers: [], heatmapPoints: [] };
    }

    const lines = [];
    const markerEvents = [];
    const heatPoints = [];

    for (const [userId, player] of Object.entries(matchData.players)) {
      if (player.is_bot && !showBots) {
        continue;
      }

      const playerPathPoints = [];
      const playerColor = player.is_bot ? "#94a3b8" : colorFromUserId(userId);

      for (const evt of player.events) {
        if (evt.ts > currentTs) {
          break;
        }

        if (evt.event === "Position" || evt.event === "BotPosition") {
          const mapped = scaleFromDataToCanvas(evt);
          playerPathPoints.push(mapped.x, mapped.y);
        }

        if (EVENT_TYPES.includes(evt.event) && eventFilter[evt.event]) {
          markerEvents.push({
            ...evt,
            userId,
            isBot: player.is_bot,
            color: EVENT_COLORS[evt.event],
          });
        }

        if (heatmapMode === "kills" && (evt.event === "Kill" || evt.event === "BotKill")) {
          heatPoints.push(evt);
        } else if (heatmapMode === "deaths" && (evt.event === "Killed" || evt.event === "KilledByStorm")) {
          heatPoints.push(evt);
        } else if (heatmapMode === "traffic" && (evt.event === "Position" || evt.event === "BotPosition")) {
          heatPoints.push(evt);
        }
      }

      if (playerPathPoints.length >= 4) {
        lines.push({
          userId,
          isBot: player.is_bot,
          points: playerPathPoints,
          color: playerColor,
        });
      }
    }

    return { pathLines: lines, markers: markerEvents, heatmapPoints: heatPoints };
  }, [currentTs, eventFilter, heatmapMode, matchData, showBots]);

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-2">
      <div className="relative h-[800px] w-[800px] overflow-hidden rounded-lg">
        <Stage width={CANVAS_SIZE} height={CANVAS_SIZE}>
          <Layer>
            {mapImage ? <KonvaImage image={mapImage} width={CANVAS_SIZE} height={CANVAS_SIZE} /> : null}
          </Layer>
          <Layer>
            {pathLines.map((line, idx) => (
              <Line
                key={`${line.userId}-${idx}`}
                points={line.points}
                stroke={line.isBot ? "#9ca3af" : line.color}
                strokeWidth={line.isBot ? 1 : 2}
                dash={line.isBot ? [8, 6] : []}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
          <Layer>
            {markers.map((evt, idx) => {
              const mapped = scaleFromDataToCanvas(evt);
              return (
                <Circle
                  key={`${evt.userId}-${evt.ts}-${evt.event}-${idx}`}
                  x={mapped.x}
                  y={mapped.y}
                  radius={4}
                  fill={evt.color}
                  onMouseEnter={() => setHoveredEvent(evt)}
                  onMouseLeave={() => setHoveredEvent(null)}
                />
              );
            })}
          </Layer>
        </Stage>

        <Heatmap points={heatmapPoints} visible={heatmapMode !== "none"} />
      </div>

      <div className="mt-2 min-h-6 text-sm text-slate-300">
        {hoveredEvent ? `Event: ${hoveredEvent.event} | Timestamp: ${hoveredEvent.ts}` : "Hover marker for details"}
      </div>
    </div>
  );
}

export default MapCanvas;
