import { useEffect, useRef } from "react";
import h337 from "heatmap.js";
import { CANVAS_SIZE, scaleFromDataToCanvas } from "../utils/coordinates";

function Heatmap({ points, visible }) {
  const containerRef = useRef(null);
  const heatmapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || heatmapRef.current) {
      return;
    }
    heatmapRef.current = h337.create({
      container: containerRef.current,
      radius: 18,
      maxOpacity: 0.6,
      minOpacity: 0,
      blur: 0.85,
      gradient: {
        0.2: "#22d3ee",
        0.4: "#3b82f6",
        0.6: "#eab308",
        0.8: "#f97316",
        1.0: "#ef4444",
      },
    });
  }, []);

  useEffect(() => {
    if (!heatmapRef.current) {
      return;
    }
    if (!visible || points.length === 0) {
      heatmapRef.current.setData({ max: 1, data: [] });
      return;
    }

    const transformed = points.map((point) => {
      const mapped = scaleFromDataToCanvas(point);
      return { x: mapped.x, y: mapped.y, value: 1 };
    });
    heatmapRef.current.setData({ max: 8, data: transformed });
  }, [points, visible]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute left-0 top-0 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    />
  );
}

export default Heatmap;
