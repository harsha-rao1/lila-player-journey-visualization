# INSIGHTS

## 1) Storm Death Clustering

### What caught my eye

`KilledByStorm` is low-volume overall (39 events), but those deaths are not random. They appear in repeated local clusters within specific map sectors instead of uniformly across the map.

### Concrete evidence

- Total `KilledByStorm` events: **39**
- Repeating storm-death bins (8x8 grid over minimap):
  - `Lockdown (5,3)`: **3**
  - `AmbroseValley (3,5)`: **3**
  - Multiple bins with **2** deaths each nearby
- This concentration pattern is visible despite low global counts.

### Actionable items

- Review storm timing and contraction geometry around the clustered sectors.
- Add stronger route readability (landmarks/cover corridors) near late-rotation pinch points.
- Consider minor storm pacing adjustments in maps where cluster recurrence appears across days.

### Why a level designer should care

Storm deaths that cluster in repeat locations usually indicate forced pathing or readability gaps. Reducing these spikes can improve fair-loss perception and increase match retention in late-game loops.

---

## 2) Dead Zones (Low/Zero Traffic Areas)

### What caught my eye

All maps contain many low-traffic or zero-traffic cells, implying large playable space that currently contributes little to decision-making or encounter density.

### Concrete evidence

Using an 8x8 minimap grid and counting `Position` + `BotPosition`:

- **AmbroseValley**: 24 zero-traffic cells, 26 cells with fewer than 10 traversals
- **GrandRift**: 27 zero-traffic cells, 32 cells with fewer than 10 traversals
- **Lockdown**: 35 zero-traffic cells, 36 cells with fewer than 10 traversals

At finer 32x32 resolution, dead-zone share remains high (approx. **57% to 68%** depending on map).

### Actionable items

- Inject path attractors in low-traffic sectors (loot value, extraction incentives, traversal shortcuts).
- Rebalance obstacle density where route cost is too high compared to reward.
- Introduce rotating objectives/events that deliberately spawn in underused areas.

### Why a level designer should care

Dead zones reduce tactical variety and replay depth. Improving route viability can increase map utilization, encounter diversity, and pacing quality.

---

## 3) Bot vs Human Movement/Death Patterns

### What caught my eye

Bot and human deaths diverge by location, especially in AmbroseValley and Lockdown, suggesting AI pathing/engagement behavior differs from real player routing.

### Concrete evidence

- Death totals by map (human vs bot):
  - `AmbroseValley`: **316 human**, **189 bot**
  - `GrandRift`: **30 human**, **22 bot**
  - `Lockdown`: **99 human**, **86 bot**
- High divergence bins (8x8 grid, bins with >=5 deaths):
  - `AmbroseValley (4,4)`: bot 12 vs human 47
  - `AmbroseValley (2,4)`: bot 29 vs human 56
  - `Lockdown (3,5)`: bot 12 vs human 2

### Actionable items

- Audit AI navigation mesh and combat behavior around divergence hotspots.
- Compare bot decision thresholds (cover usage, retreat, pursuit) to player behavior in those sectors.
- Add targeted simulation tests for hotspot bins and track:
  - bot survival rate by zone,
  - time-to-death delta vs humans,
  - bot engagement-to-kill conversion.

### Why a level designer should care

If bots die or route differently than humans in specific areas, encounter quality and perceived fairness can drift. Tightening AI-map alignment improves both PvE credibility and mixed-lobby balance.
