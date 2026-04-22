import { useEffect, useMemo, useState } from "react";
import Legend from "./components/Legend";
import MapCanvas from "./components/MapCanvas";
import Sidebar from "./components/Sidebar";
import Timeline from "./components/Timeline";
import { EVENT_TYPES, HEATMAP_MODES, MAP_IMAGE_BY_ID } from "./utils/coordinates";

function App() {
  const [indexData, setIndexData] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [selectedMap, setSelectedMap] = useState("AmbroseValley");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [showBots, setShowBots] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState(HEATMAP_MODES.NONE);
  const [currentTs, setCurrentTs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [eventFilter, setEventFilter] = useState(
    EVENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: true }), {})
  );

  useEffect(() => {
    async function loadIndex() {
      const response = await fetch("/data/index.json");
      const data = await response.json();
      setIndexData(data);
    }
    loadIndex();
  }, []);

  const maps = useMemo(() => ["AmbroseValley", "GrandRift", "Lockdown"], []);
  const dates = useMemo(
    () => ["February_10", "February_11", "February_12", "February_13", "February_14"],
    []
  );

  const filteredMatches = useMemo(() => {
    return indexData.filter(
      (match) => match.map_id === selectedMap && (selectedDate === "All" || match.date === selectedDate)
    );
  }, [indexData, selectedMap, selectedDate]);

  useEffect(() => {
    if (!filteredMatches.length) {
      setSelectedMatchId("");
      setMatchData(null);
      return;
    }
    if (!filteredMatches.some((match) => match.match_id === selectedMatchId)) {
      setSelectedMatchId(filteredMatches[0].match_id);
    }
  }, [filteredMatches, selectedMatchId]);

  useEffect(() => {
    async function loadMatch() {
      if (!selectedMatchId) {
        return;
      }
      const response = await fetch(`/data/${selectedMatchId}.json`);
      const data = await response.json();
      setMatchData(data);
      setCurrentTs(0);
      setIsPlaying(false);
    }
    loadMatch();
  }, [selectedMatchId]);

  const maxTs = useMemo(() => {
    if (!matchData) {
      return 0;
    }
    let max = 0;
    for (const player of Object.values(matchData.players)) {
      for (const evt of player.events) {
        if (evt.ts > max) {
          max = evt.ts;
        }
      }
    }
    return max;
  }, [matchData]);

  useEffect(() => {
    if (!isPlaying || maxTs === 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      setCurrentTs((prev) => {
        const next = prev + 1000;
        if (next >= maxTs) {
          setIsPlaying(false);
          return maxTs;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [isPlaying, maxTs]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <h1 className="mb-4 text-2xl font-semibold">LILA Player Journey Visualization Tool</h1>

      <div className="flex gap-4">
        <Sidebar
          maps={maps}
          selectedMap={selectedMap}
          onMapChange={setSelectedMap}
          dates={dates}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          matches={filteredMatches}
          selectedMatchId={selectedMatchId}
          onMatchChange={setSelectedMatchId}
          showBots={showBots}
          onToggleBots={setShowBots}
          eventFilter={eventFilter}
          onToggleEvent={(eventType, checked) =>
            setEventFilter((prev) => ({
              ...prev,
              [eventType]: checked,
            }))
          }
          heatmapMode={heatmapMode}
          onHeatmapModeChange={setHeatmapMode}
        />

        <main className="flex flex-1 flex-col">
          <MapCanvas
            imageSrc={MAP_IMAGE_BY_ID[selectedMap]}
            matchData={matchData}
            currentTs={currentTs}
            showBots={showBots}
            eventFilter={eventFilter}
            heatmapMode={heatmapMode}
          />
          <Timeline
            maxTs={maxTs}
            currentTs={currentTs}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((prev) => !prev)}
            onSeek={setCurrentTs}
          />
        </main>

        <Legend />
      </div>
    </div>
  );
}

export default App;
