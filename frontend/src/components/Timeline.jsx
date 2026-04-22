function Timeline({ maxTs, currentTs, isPlaying, onTogglePlay, onSeek }) {
  return (
    <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <button
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        onClick={onTogglePlay}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <input
        className="h-2 w-full accent-indigo-500"
        type="range"
        min={0}
        max={Math.max(0, maxTs)}
        value={Math.min(currentTs, maxTs)}
        onChange={(e) => onSeek(Number(e.target.value))}
      />
      <div className="w-44 text-right text-sm text-slate-300">
        {Math.floor(currentTs)} ms / {Math.floor(maxTs)} ms
      </div>
    </div>
  );
}

export default Timeline;
