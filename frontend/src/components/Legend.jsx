import { EVENT_COLORS } from "../utils/coordinates";

function Legend() {
  return (
    <aside className="w-72 shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Legend</h2>

      <div className="mb-4 space-y-2 text-sm text-slate-200">
        <div className="flex items-center gap-2">
          <span className="h-[2px] w-6 bg-cyan-300" />
          Human path (2px solid, unique color)
        </div>
        <div className="flex items-center gap-2">
          <span className="h-[1px] w-6 border-t border-dashed border-slate-400" />
          Bot path (1px dashed gray)
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-200">
        {Object.entries(EVENT_COLORS).map(([eventType, color]) => (
          <div key={eventType} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            {eventType}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Legend;
