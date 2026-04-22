# LILA Player Journey Visualization Tool

Web-based telemetry visualization tool for LILA BLACK match data. It preprocesses raw parquet files into lightweight JSON and renders interactive match replays, event overlays, and heatmaps on top of map minimaps.

## Tech Stack

- **Data pipeline:** Python (`pandas`, `pyarrow`)
- **Frontend:** React + Vite
- **Rendering:** `react-konva` (canvas), `heatmap.js` (overlays)
- **Styling:** Tailwind CSS
- **Deployment target:** Vercel

## Project Structure

```text
project/
├── preprocess.py
├── requirements.txt
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── MapCanvas.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── Heatmap.jsx
│   │   │   └── Legend.jsx
│   │   └── utils/
│   │       └── coordinates.js
│   └── public/
│       ├── minimaps/
│       └── data/
├── ARCHITECTURE.md
└── INSIGHTS.md
```

## Setup

### 1) Python dependencies

From repository root:

```bash
pip install -r requirements.txt
```

### 2) Generate match JSON from parquet

From repository root:

```bash
python preprocess.py
```

Output is written to:

- `frontend/public/data/*.json` (one file per match)
- `frontend/public/data/index.json` (match metadata for dropdowns/filters)

### 3) Frontend install + run

```bash
cd frontend
npm install
npm run dev
```

Local app URL is printed by Vite (typically `http://localhost:5173`).

### 4) Production build

```bash
cd frontend
npm run build
npm run preview
```

## Features

- Map selector (`AmbroseValley`, `GrandRift`, `Lockdown`)
- Match selector filtered by map and date
- Human vs bot path rendering
- Event markers (`Kill`, `Killed`, `BotKill`, `BotKilled`, `KilledByStorm`, `Loot`)
- Timeline playback and manual scrubber
- Heatmap overlays (kills, deaths, traffic)
- Legend panel for path/marker semantics

## Environment Variables

No environment variables are required.

## Deployment

Deploy the `frontend` folder to Vercel as a static Vite app.

- `frontend/vercel.json` is included for SPA route handling.
- Data files in `public/data` and minimaps in `public/minimaps` are served as static assets.

Deployed URL: **`<ADD_VERCEL_URL_HERE>`**
