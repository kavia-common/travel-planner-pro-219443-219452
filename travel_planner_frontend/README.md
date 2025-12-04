# Travel Planner Frontend (React)

A modern React frontend for Travel Planner Pro. It provides a dashboard, trips management, itinerary editing, and a calendar view, with optional live updates over WebSockets and a minimal global state store.

## Overview

This app is built with:
- React 18 and react-router-dom for routing
- A lightweight Context + Reducer store (no Redux)
- Minimal CSS using a custom Ocean Professional theme
- Optional WebSocket client (feature-flag gated)
- Simple services wrapping fetch and environment-aware configuration

The UI follows the Ocean Professional style: blue primary with amber accents, subtle gradients, smooth transitions, and rounded surfaces.

## Ocean Professional Style Guide (Summary)

- Primary: #2563EB (blue)
- Secondary/Success accent: #F59E0B (amber)
- Error: #EF4444
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827
- Gradient: from-blue-500/10 to gray-50 (subtle header/surface depth)
- Dark mode is supported via [data-theme="dark"] overrides

These values are implemented as CSS variables in src/styles/theme.css and used consistently across components.

## Environment Variables

Place variables in a .env file at the project root (or use your CI/CD environment). All variables are prefixed with REACT_APP_ to be accessible at build time.

- REACT_APP_API_BASE: Base HTTP API endpoint (preferred)
- REACT_APP_BACKEND_URL: Fallback base HTTP API endpoint if REACT_APP_API_BASE is not set
- REACT_APP_FRONTEND_URL: Public URL of the frontend (informational; used by env)
- REACT_APP_WS_URL: WebSocket endpoint (e.g., wss://api.example.com/ws)
- REACT_APP_NODE_ENV: development | production | test (defaults to development)
- REACT_APP_NEXT_TELEMETRY_DISABLED: true/false to disable Next telemetry semantics if needed
- REACT_APP_ENABLE_SOURCE_MAPS: true/false (defaults to true unless explicitly 'false')
- REACT_APP_PORT: Port hint (for container setups; CRA typically uses 3000 at dev)
- REACT_APP_TRUST_PROXY: true/false (normalizes to boolean)
- REACT_APP_LOG_LEVEL: error | warn | info | debug (default info)
- REACT_APP_HEALTHCHECK_PATH: HTTP healthcheck path (default /health)
- REACT_APP_FEATURE_FLAGS: Comma-separated flags (see Feature Flags below)
- REACT_APP_EXPERIMENTS_ENABLED: true/false global experiments toggle

Example .env:
```bash
# Core endpoints
REACT_APP_API_BASE=https://api.example.com
REACT_APP_BACKEND_URL=
REACT_APP_FRONTEND_URL=https://app.example.com

# Optional WebSocket live updates
REACT_APP_WS_URL=wss://api.example.com/ws

# Runtime and logging
REACT_APP_NODE_ENV=development
REACT_APP_LOG_LEVEL=info
REACT_APP_ENABLE_SOURCE_MAPS=true
REACT_APP_TRUST_PROXY=false
REACT_APP_PORT=3000

# Healthcheck
REACT_APP_HEALTHCHECK_PATH=/health

# Feature flags
# boolean flags: "flagA,flagB"
# key=value flags: "flagC=on,flagD=v2", "flagE=true"
REACT_APP_FEATURE_FLAGS=liveUpdates,theme=dark
REACT_APP_EXPERIMENTS_ENABLED=false

# Disable Next telemetry semantics (kept for parity/library usage)
REACT_APP_NEXT_TELEMETRY_DISABLED=true
```

## Scripts

In the project directory:

```bash
# Development server
npm start

# Run tests (watch mode)
npm test

# Production build output in ./build
npm run build

# Eject CRA (irreversible)
npm run eject
```

Notes:
- The dev server runs on http://localhost:3000 by default.
- Set PORT in the environment to change the dev port if needed.

## How to Run

Development:
```bash
npm install
npm start
```
- The app will be available at http://localhost:3000.
- Ensure REACT_APP_API_BASE points to a reachable backend.

Build:
```bash
npm run build
```
- Produces a production build in the build/ folder.

## Architecture

- Routing: react-router-dom v6; routes are defined in:
  - src/App.js (main usage)
  - src/routes/Router.jsx (centralized route module ready for future code-splitting)
- Global State Store: src/state/store.js
  - Context + Reducer with actionCreators
  - Tracks trips, itineraries per trip, selectedTrip, and loading/errors keyed by operation
- Services: src/services/
  - http.js: fetch wrapper with baseUrl, timeouts, JSON handling, log-level control
  - tripsService.js, itineraryService.js, userService.js: CRUD wrappers using http client
  - ws.js: optional WebSocket client with auto-reconnect and topic-based subscriptions
- Hooks: src/hooks/
  - useTrips.js: load and mutate trips, optional WebSocket/polling updates
  - useItinerary.js: per-trip itinerary operations, optional WebSocket/polling updates
  - useFetch.js: generic async helper
  - useTheme.js: light/dark theme with localStorage and [data-theme] attribute
- Components: src/components/
  - common/: Button, Card, Header, Modal, Sidebar, Toast
  - trips/: TripForm, TripList, TripListItem
  - itinerary/: ItineraryForm, ItineraryItem, ItineraryView
  - calendar/: CalendarView
- Pages: src/pages/
  - Dashboard, Trips, TripDetails, Calendar, Settings
- Theme and Utilities: src/styles/theme.css and src/styles/util.css

## Feature Flags

Feature flags are parsed from REACT_APP_FEATURE_FLAGS and REACT_APP_EXPERIMENTS_ENABLED in src/config/env.js and exposed via src/flags/featureFlags.js.

- Boolean flags: "liveUpdates,darkUI"
- Key=value flags: "theme=dark,calendarMode=v2"
- Helpers:
  - isEnabled('flag'): boolean for simple flags or key=value truthy (true/1/yes/on/enabled)
  - getFlag('flag', defaultValue): returns string value for key=value flags
  - experimentsOn(): mirrors REACT_APP_EXPERIMENTS_ENABLED
  - allFlags(): debug snapshot of parsed flags

Example usage:
```javascript
import { isEnabled, getFlag, experimentsOn } from './flags/featureFlags';

if (isEnabled('liveUpdates')) {
  // enable WS and/or UI affordances
}

const theme = getFlag('theme', 'light');
// theme -> 'dark' if REACT_APP_FEATURE_FLAGS includes theme=dark

if (experimentsOn()) {
  // enable experimental components
}
```

## Optional WebSocket Setup

Live updates are enabled only when both conditions are met:
1) REACT_APP_WS_URL is set to a valid ws/wss URL (env.wsBase)
2) Feature flag 'liveUpdates' is enabled in REACT_APP_FEATURE_FLAGS

When enabled, useTrips and useItinerary will:
- Start the shared WebSocket client (ws.js)
- Subscribe to 'trips' and 'itinerary:<tripId>' topics
- Fallback to periodic polling and keep a safety polling even with WS to avoid missed events

If your backend expects explicit subscription messages, see the commented section in src/services/ws.js to send { action: 'subscribe', topic } upon connection.

## Healthcheck and Environment Badge

- Healthcheck path is configurable via REACT_APP_HEALTHCHECK_PATH (default /health); it can be used by container orchestrators or uptime monitors against the backend or a simple frontend status endpoint if implemented.
- The environment (env.nodeEnv) and log level (env.logLevel) are available via src/config/env.js. Consider adding a small badge or footer label with env.nodeEnv for non-prod builds if desired.

Example badge snippet:
```javascript
import { env } from './config/env';

function EnvBadge() {
  if (env.isProd) return null;
  return <div style={{ position: 'fixed', bottom: 8, right: 8, fontSize: 12, opacity: 0.8 }}>
    {env.nodeEnv} | log: {env.logLevel}
  </div>;
}
```

## Testing Notes

- Jest + React Testing Library are provided via react-scripts.
- Place component/page tests next to their modules or under src/__tests__/.
- Run tests with:
```bash
npm test
```

CI mode:
- Use the dedicated CI script to run tests once and exit (no watch, with CI env):
```bash
npm run test:ci
```

### Manual Performance Checks (no extra tooling)

1) Lighthouse Audits (in Chrome/Edge)
- Start the app: npm start
- Open the app in Chrome/Edge (e.g., http://localhost:3000)
- Open DevTools > Lighthouse (or use the Chrome Lighthouse panel)
- Select categories (Performance, Accessibility, Best Practices, SEO)
- Choose Device: Mobile or Desktop
- Click “Analyze page load”
- Review metrics (LCP, CLS, TBT, etc.) and opportunities. Repeat after changes.

2) Bundle Size via CRA Build Output
- Run a production build:
```bash
npm run build
```
- CRA prints gzipped bundle sizes after the build completes. Review the “File sizes after gzip” section in the terminal output to track main bundle, vendor chunks, and route/component chunks.
- The build artifacts are in the build/ folder. You can also inspect build/static/js for per-chunk sizes and build/static/css for styles.

Tips to keep bundles lean (no new dependencies required):
- Prefer code splitting for large, rarely used pages/components using React.lazy and dynamic import().
- Avoid unnecessary re-exports that force large dependency graphs to load eagerly.
- Keep images and assets optimized; prefer modern formats where possible.
- Ensure dead code is removed by guarding feature code paths with flags and environment checks.

## .env Quickstart

Create a .env file for development:
```bash
REACT_APP_API_BASE=http://localhost:4000
REACT_APP_WS_URL=ws://localhost:4000/ws
REACT_APP_NODE_ENV=development
REACT_APP_LOG_LEVEL=debug
REACT_APP_FEATURE_FLAGS=liveUpdates
REACT_APP_HEALTHCHECK_PATH=/health
REACT_APP_ENABLE_SOURCE_MAPS=true
```

Then:
```bash
npm install
npm start
```

## Useful Imports

- env: src/config/env.js
- feature flags: src/flags/featureFlags.js
- store: src/state/store.js
- http client: src/services/http.js
- services: src/services/*.js
- router: src/routes/Router.jsx

---
