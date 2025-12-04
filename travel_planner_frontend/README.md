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

## Accessibility Guarantees

The UI aims to be accessible by default across navigation, dialogs, and live regions. The following behaviors are guaranteed by components in this codebase:

- Focus visibility and keyboard navigation:
  - All interactive components rendered via common/Button.jsx and links in common/Header.jsx present clear focus indicators. Header theme toggle sets a visible focus ring on focus and supports Enter/Space activation.
  - Keyboard navigation across the application is supported using Tab/Shift+Tab. Primary navigation is implemented with semantic elements and ARIA labeling for screen readers: the header uses aria-label on <header>, the nav container uses role="navigation" with aria-label="Primary", and the health indicator uses role="status" with aria-live="polite".
- ARIA roles:
  - Header status indicator: role="status" with aria-live="polite" and aria-atomic="true" to announce backend health changes.
  - Navigation landmarks: header and nav include appropriate roles/labels; page containers use Card components with descriptive titles.
  - Calendar, forms, and lists utilize semantic HTML; form controls include associated labels in forms such as trips/itinerary.
- Modal focus trap:
  - common/Modal.jsx sets role="dialog" and aria-modal="true", and exposes aria-labelledby and aria-describedby IDs. It traps focus within the dialog and supports Shift+Tab wrapping. On open, it moves focus to an initial focus target or the first focusable element and restores focus to the previously active element upon close. It also sets aria-hidden="true" on main landmarks while open to prevent screen readers from accessing background content.
- Keyboard handling:
  - Escape closes the modal. Tab/Shift+Tab cycle focus within the modal. Click on the overlay (outside the dialog) closes the modal, preserving keyboard accessibility.
- Live regions:
  - The backend status text in common/Header.jsx and the Settings page use role="status" and aria-live="polite" to announce changes for screen readers.

Refer to:
- src/components/common/Modal.jsx
- src/components/common/Header.jsx
- src/pages/Settings.jsx

## Health and Status UI

The header includes a real-time health indicator for the backend:
- Meanings:
  - Green dot and “Online”: The health endpoint returned an OK status (various payload shapes supported).
  - Red dot and “Offline”: The health endpoint failed or returned an unhealthy state.
  - Gray dot and “Checking…”: Initial or unknown state before the first check completes.
- Update cadence: An initial ping on mount, then automatic checks every 30 seconds.
- Manual checks: Navigate to Settings and click “Check status” to trigger a manual health ping. The Settings page mirrors the same status badge with an ARIA live region.

Implementation references:
- src/services/healthService.js (pingHealth and getStatusText)
- src/components/common/Header.jsx (header status indicator)
- src/pages/Settings.jsx (manual status check UI)

## Testing

We use Jest with React Testing Library via react-scripts. Tests live close to the modules they cover, typically under src/**/__tests__ or alongside the component.

- Commands:
  - Run in watch mode:
    ```bash
    npm test
    ```
  - CI one-shot mode:
    ```bash
    npm run test:ci
    ```
    This sets CI=true and disables watch mode: see package.json scripts.

- Folder layout and examples:
  - Components:
    - src/components/common/__tests__/test_Button.jsx covers visual and interactive behavior of Button.
    - src/components/common/__tests__/test_Modal.jsx validates focus trapping, ARIA attributes, and close behavior.
    - src/components/trips/__tests__/test_TripList.jsx checks rendering and interactions for the Trips list.
  - Hooks:
    - src/hooks/__tests__/test_useTrips_and_useItinerary.jsx asserts data loading, CRUD flows, WebSocket gating, and error handling.
  - Services:
    - src/services/__tests__/test_http_and_services.js tests HTTP wrapper behavior and trips/itinerary service methods.
  - App:
    - src/App.test.js verifies routing, layout shell, and that key views render.

- What tests cover (high level):
  - Rendering and navigation of top-level routes
  - CRUD flows for trips and itineraries
  - WebSocket subscription gating by feature flag and URL presence
  - Accessibility behaviors in Modal (focus trap, roles)
  - HTTP client request/response handling and error paths

## Performance Practices

This project follows simple, practical performance steps without extra dependencies:
- Component memoization and stable values: Hooks such as useTheme and components like Header use useMemo where appropriate for derived values (e.g., the status dot style).
- Cleanup and lifecycles: Effects that register intervals, event listeners, or WebSockets always tear down cleanly (e.g., Header’s interval, Modal’s keydown listener and scroll lock).
- Optional code-splitting: Routes are structured to support future lazy-loading (see src/routes/Router.jsx). You can wrap page components with React.lazy and Suspense to split less-used pages.
- Network efficiency: The health service uses a small timeout and normalized parsing to avoid long blocking calls in the UI.

## Environment Badge Behavior

An environment badge can be used during development and staging to show environment information. Example:
```javascript
import { env } from './config/env';

function EnvBadge() {
  if (env.isProd) return null; // The badge is hidden in production builds
  return <div style={{ position: 'fixed', bottom: 8, right: 8, fontSize: 12, opacity: 0.8 }}>
    {env.nodeEnv} | log: {env.logLevel}
  </div>;
}
```
- Non-prod only: The example guards by env.isProd to avoid exposing internal details in production.
- Available values: env.nodeEnv, env.logLevel, and other flags are exported from src/config/env.js.

## Troubleshooting

If the UI or tests do not behave as expected, check the following:

- Environment variables (build-time):
  - Ensure .env contains required entries. At a minimum, set REACT_APP_API_BASE to your backend base URL. Optional WebSocket updates require REACT_APP_WS_URL.
  - REACT_APP_HEALTHCHECK_PATH defaults to /health. If your backend exposes a different path (e.g., /status, /livez, /healthz), set the variable accordingly.

- CORS:
  - If API requests fail due to CORS, configure your backend to allow the frontend origin (REACT_APP_FRONTEND_URL) and necessary headers/methods. The frontend uses fetch via src/services/http.js.

- Backend health path:
  - Verify the health endpoint responds with a recognizable “ok” status. healthService accepts:
    - string payloads that include “ok/healthy/up” (case-insensitive)
    - objects with status or state fields like “ok”, “up”, “healthy”, “pass/passing”
  - Update REACT_APP_HEALTHCHECK_PATH to match your server if needed.

- WebSocket URL and flags:
  - Live updates start only if:
    - REACT_APP_WS_URL is set to a valid ws:// or wss:// URL, and
    - The “liveUpdates” feature flag is enabled in REACT_APP_FEATURE_FLAGS (boolean flag or truthy key=value).
  - If your server expects subscribe messages, see the commented example in src/services/ws.js and implement send({ action: 'subscribe', topic }).

- CI test issues:
  - Use npm run test:ci to run tests in non-interactive CI mode. This uses the script defined in package.json: CI=true react-scripts test --watchAll=false.
  - Snapshot or async failures are often due to environment differences; ensure you do not rely on network in unit tests.

- Logging and diagnostics:
  - Increase verbosity by setting REACT_APP_LOG_LEVEL=debug and re-running in development. Some modules conditionally print diagnostics when log level allows.

References:
- src/config/env.js
- src/services/healthService.js
- src/components/common/Header.jsx
- src/components/common/Modal.jsx
- src/services/ws.js
- src/pages/Settings.jsx

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
