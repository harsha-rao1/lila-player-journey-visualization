export const MAP_IMAGE_BY_ID = {
  AmbroseValley: "/minimaps/AmbroseValley_Minimap.png",
  GrandRift: "/minimaps/GrandRift_Minimap.png",
  Lockdown: "/minimaps/Lockdown_Minimap.jpg",
};

export const EVENT_TYPES = [
  "Kill",
  "Killed",
  "BotKill",
  "BotKilled",
  "KilledByStorm",
  "Loot",
];

export const EVENT_COLORS = {
  Kill: "#ef4444",
  Killed: "#9ca3af",
  BotKill: "#f97316",
  BotKilled: "#c2410c",
  KilledByStorm: "#a855f7",
  Loot: "#facc15",
};

export const HEATMAP_MODES = {
  NONE: "none",
  KILLS: "kills",
  DEATHS: "deaths",
  TRAFFIC: "traffic",
};

export const CANVAS_SIZE = 800;

export const scaleFromDataToCanvas = (point) => ({
  x: (point.px / 1024) * CANVAS_SIZE,
  y: (point.py / 1024) * CANVAS_SIZE,
});

export function colorFromUserId(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 75% 55%)`;
}
