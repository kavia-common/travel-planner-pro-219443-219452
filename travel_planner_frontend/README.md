# Travel Planner Frontend

This is the React-based UI for Travel Planner Pro.

## Ocean Professional Theme

The app uses the Ocean Professional theme with centralized CSS variables and utilities.

Palette:
- Primary: #2563EB
- Secondary/Amber: #F59E0B
- Error: #EF4444
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827
- Gradient: subtle blue to gray tint

Where:
- Variables and utilities live in src/theme/ocean.css.
- Globally imported in src/index.css (after any resets).

Utilities:
- Buttons: .btn, .btn-primary, .btn-secondary, .btn-ghost
- Inputs: .input, .select
- Cards: .card, .card-header, .card-body
- Tabs: .tabs, .tab
- Badges/Chips: .badge, .chip
- Progress: .progress > .bar
- Layout helpers: .grid, .grid-1-2-3
- Table helpers: .table (with .table-scroll wrapper)
- Accessibility: focus-visible outlines; prefers-reduced-motion respected
- Motion: subtle hover/focus transitions at 150–200ms, softened shadows

Responsiveness:
- .grid-1-2-3 adjusts to 1/2/3 columns at small/medium/large widths.
- Tabs wrap gracefully; tables can scroll on mobile using .table-scroll.

Override variables by redefining them in a stylesheet loaded after ocean.css:

```css
:root {
  --color-primary: #1D4ED8;
  --radius-md: 12px;
}
```

Feature flags for visual verification:
- REACT_APP_FEATURE_FLAGS=ocean-theme,all-panels
- REACT_APP_EXPERIMENTS_ENABLED=true

See .env.example for a complete list of variables.

## Notifications and Reminders

This app provides in-app notifications and reminders with optional browser notifications.

- Create reminders for trip start, check-in/checkout, activity times, packing reminders, and custom notes.
- In-app notifications appear in a toast and in the notifications panel; a bell icon shows unread count.
- Optional Browser Notifications: if permission is granted, a native notification appears.
- Snooze actions (+10m/+1h), Dismiss, and Mark as done are supported.
- Data persists per trip using HTTP-first with seamless localStorage fallback.
- Scheduling persists to localStorage and recovers after page reload; missed reminders appear as such.

Feature flags:
- FEATURE_NOTIFICATIONS (default: true)
- REMINDERS (default: true)
- BROWSER_NOTIFICATIONS (default: true)

Environment variables:
- REACT_APP_FEATURE_FLAGS: JSON or comma-separated to control flags
- REACT_APP_FEATURE_NOTIFICATIONS=true|false
- REACT_APP_REMINDERS=true|false
- REACT_APP_BROWSER_NOTIFICATIONS=true|false

Routes:
- /notifications → full notifications panel with filters and browser notification toggle.

If backend endpoints are not present, services automatically fall back to localStorage.

## Budget Tracking Feature

The app includes a Budget Tracking module (enabled by default) that lets users:
- Add/edit/delete expenses per trip
- See totals and per-category breakdown
- Choose a display currency with lightweight conversion
- Optionally set a planned budget for remaining calculations

Feature flag:
- FEATURE_BUDGET (default: true). Disable by setting REACT_APP_FEATURE_FLAGS to include {"FEATURE_BUDGET": false} or "FEATURE_BUDGET=false" (comma-separated syntax).

Environment variables for currency rates (optional):
- REACT_APP_EXCHANGE_RATES_URL: If provided, the app will fetch rates HTTP-first and cache for 24h.
- REACT_APP_EXCHANGE_RATES_API_KEY: Optional API key header (sent as Bearer token).

HTTP endpoints (optional, if backend supports them):
- GET /trips/:id/budget/expenses
- POST /trips/:id/budget/expenses
- PATCH /trips/:id/budget/expenses/:expenseId
- DELETE /trips/:id/budget/expenses/:expenseId
- GET /trips/:id/budget/planned
- POST /trips/:id/budget/planned
- GET /trips/:id/budget/settings
- POST /trips/:id/budget/settings

If endpoints are not available, the app falls back to localStorage seamlessly.

## Places Search

A Places Search feature lets users find points of interest and add them to an itinerary or save as a destination.

- UI: Trip Details includes a Places tab (if PLACES_SEARCH is enabled) with a search bar, results, and an Add action.
- Behavior: Debounced input, top 10 results, keyboard navigation (Up/Down/Enter), Escape clears, loading/empty states, and recent queries (session-scoped).
- Adding to itinerary: choose “today” or pick a date (native date input). Adds via itinerary service.
- Providers:
  - OpenStreetMap/Nominatim (default, no key) with rate-limit friendly headers.
  - Mapbox (requires REACT_APP_MAPBOX_TOKEN).
  - Google (placeholder in demo; prefer Nominatim/Mapbox).
- Fallback: Local curated dataset with fuzzy matching if no provider configured or if provider fails.

Feature flag:
- PLACES_SEARCH (default: true). Can be disabled via REACT_APP_FEATURE_FLAGS.

Provider env vars:
- REACT_APP_PLACES_PROVIDER=openstreetmap|mapbox|google (default openstreetmap)
- REACT_APP_NOMINATIM_URL (optional, default https://nominatim.openstreetmap.org)
- REACT_APP_MAPBOX_TOKEN (optional, for Mapbox provider)
- REACT_APP_GOOGLE_MAPS_API_KEY (optional, for Google provider - not fully implemented in demo)

Routes:
- The Places tab is within Trip Details. A direct route is also available: /trips/:tripId/places (renders TripDetails with the Places tab).

## Timeline Map

A split map + day-by-day timeline view shows multi-city routes with markers and a connecting polyline.

- Provider selection via REACT_APP_MAP_PROVIDER=(maplibre|mapbox|google). Defaults to maplibre.
- MapLibre works out of the box (no API key) using OpenStreetMap tiles.
- If Mapbox is selected, set REACT_APP_MAPBOX_TOKEN.
- If Google is selected, set REACT_APP_GOOGLE_MAPS_API_KEY.
- Clicking a day/item focuses the corresponding marker.
- Missing coordinates are resolved via geocoding using PlacesService and cached in localStorage per trip.

Feature flag:
- TIMELINE_MAP (default: true). Disable via REACT_APP_TIMELINE_MAP=false or REACT_APP_FEATURE_FLAGS JSON/comma syntax.

Environment variables:
- REACT_APP_MAP_PROVIDER=maplibre|mapbox|google (default maplibre)
- REACT_APP_MAPBOX_TOKEN=... (when provider=mapbox)
- REACT_APP_GOOGLE_MAPS_API_KEY=... (when provider=google)

## Environment Variables

Place variables in a .env file at the project root (or use your CI/CD environment). All variables are prefixed with REACT_APP_ to be accessible at build time.

- REACT_APP_API_BASE: Base HTTP API endpoint (preferred)
- REACT_APP_BACKEND_URL: Fallback base HTTP API endpoint if REACT_APP_API_BASE is not set
- REACT_APP_FRONTEND_URL: Public URL of the frontend (informational; used by env)
- REACT_APP_WS_URL: WebSocket endpoint (e.g., wss://api.example.com/ws)
- REACT_APP_NODE_ENV: development | production | test (defaults to development)
- REACT_APP_NEXT_TELEMETRY_DISABLED: true/false to disable Next telemetry semantics if needed
- REACT_APP_ENABLE_SOURCE_MAPS: true/false (defaults to true unless explicitly 'false')
- REACT_APP_TRUST_PROXY: true/false (normalizes to boolean)
- REACT_APP_LOG_LEVEL: error | warn | info | debug (default info)
- REACT_APP_HEALTHCHECK_PATH: HTTP healthcheck path (default /health)
- REACT_APP_FEATURE_FLAGS: Feature flags (JSON or comma-separated; see Feature Flags)
- REACT_APP_EXPERIMENTS_ENABLED: true/false global experiments toggle
- REACT_APP_EXCHANGE_RATES_URL: Optional - rates API endpoint for currency conversion (see Budget Tracking)
- REACT_APP_EXCHANGE_RATES_API_KEY: Optional - API key for the rates provider
- REACT_APP_PLACES_PROVIDER: openstreetmap | mapbox | google (default openstreetmap)
- REACT_APP_NOMINATIM_URL: Optional - override Nominatim base URL (default https://nominatim.openstreetmap.org)
- REACT_APP_MAPBOX_TOKEN: Optional - token for Mapbox Geocoding API
- REACT_APP_GOOGLE_MAPS_API_KEY: Optional - Google Places API key (demo not fully implemented)

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
# JSON syntax:
REACT_APP_FEATURE_FLAGS={"FEATURE_BUDGET":true,"ITINERARY_CALENDAR":true,"PLACES_SEARCH":true,"FEATURE_NOTIFICATIONS":true,"REMINDERS":true,"BROWSER_NOTIFICATIONS":true}
# OR comma-separated:
# REACT_APP_FEATURE_FLAGS=FEATURE_BUDGET,ITINERARY_CALENDAR,PACKING_LIST,PLACES_SEARCH,FEATURE_NOTIFICATIONS,REMINDERS,BROWSER_NOTIFICATIONS

REACT_APP_EXPERIMENTS_ENABLED=false

# Currency rates (optional)
REACT_APP_EXCHANGE_RATES_URL=https://api.exchangerate.host/latest
REACT_APP_EXCHANGE_RATES_API_KEY=
```

## Global Search

The app includes a Global Search feature (command-palette style) with:
- Header search bar with keyboard shortcuts: "/" to focus, Cmd/Ctrl+K to open.
- Modal with grouped results (Trips, Itinerary, Places, Packing, Budget) and keyboard navigation (Up/Down/Enter/Escape).
- Full results page at /search?q= with filter chips and pagination.

Routing:
- /search -> full results page

Feature flag:
- GLOBAL_SEARCH (default: true). Configure via src/flags/featureFlags.js or REACT_APP_FEATURE_FLAGS.

Works with or without backend endpoints:
- Uses HTTP-first if endpoints are available; seamless localStorage fallbacks from existing services otherwise.

Styling:
- Ocean Professional theme with soft shadows, rounded corners, and subtle transitions.

## Development

- npm start
- npm test
- npm run build

## Accessibility & Motion

- Focus states are visible with high-contrast outlines (focus-visible).
- Motion is subtle (150–200ms) and respects prefers-reduced-motion.
