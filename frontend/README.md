# BhoomiGuard AI — SIH Frontend

A polished React + Tailwind CSS prototype for an AI-enabled real-time mine subsidence monitoring and early-warning platform.

## Features
- Operations dashboard
- Live deformation/GIS-style map with interactive sensor nodes
- AI risk trend and model signals
- Alert center
- Sensor network telemetry table
- Reports page
- Settings page
- Framer Motion page/card animations
- Responsive desktop/mobile layout
- Mock data isolated in `src/data/mock.js`

## Run
```bash
npm install
npm run dev
```

## Backend integration
Replace mock data and chart values with API/WebSocket/MQTT gateway data. Suggested endpoints:
- `GET /api/nodes`
- `GET /api/alerts`
- `GET /api/risk/trend`
- `GET /api/ai/prediction/:zone`
- WebSocket: `/ws/telemetry`

The UI deliberately uses realistic demo data so it can be presented before the IoT/backend is connected.
