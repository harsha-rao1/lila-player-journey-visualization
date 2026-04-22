import { EVENT_TYPES, HEATMAP_MODES } from "../utils/coordinates";

function Sidebar({
  maps,
  selectedMap,
  onMapChange,
  dates,
  selectedDate,
  onDateChange,
  matches,
  selectedMatchId,
  onMatchChange,
  showBots,
  onToggleBots,
  eventFilter,
  onToggleEvent,
  heatmapMode,
  onHeatmapModeChange,
}) {
  return (
    <aside className="w-72 shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Controls</h2>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-slate-300">Map</label>
        <select
          className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm"
          value={selectedMap}
          onChange={(e) => onMapChange(e.target.value)}
        >
          {maps.map((mapId) => (
            <option key={mapId} value={mapId}>
              {mapId}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-slate-300">Date</label>
        <select
          className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        >
          <option value="All">All</option>
          {dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="mb-1 block text-sm text-slate-300">Match</label>
        <select
          className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm"
          value={selectedMatchId}
          onChange={(e) => onMatchChange(e.target.value)}
        >
          {matches.map((match) => (
            <option key={match.match_id} value={match.match_id}>
              {match.match_id}
            </option>
          ))}
        </select>
      </div>

      <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-slate-200">
        <input type="checkbox" checked={showBots} onChange={(e) => onToggleBots(e.target.checked)} />
        Show Bots
      </label>

      <div className="mb-5">
        <p className="mb-2 text-sm text-slate-300">Event Filters</p>
        <div className="space-y-1">
          {EVENT_TYPES.map((eventType) => (
            <label key={eventType} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={eventFilter[eventType]}
                onChange={(e) => onToggleEvent(eventType, e.target.checked)}
              />
              {eventType}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-slate-300">Heatmap Overlay</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(HEATMAP_MODES).map((mode) => (
            <button
              key={mode}
              className={`rounded-md px-2 py-1 text-sm capitalize ${
                heatmapMode === mode ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-200"
              }`}
              onClick={() => onHeatmapModeChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
