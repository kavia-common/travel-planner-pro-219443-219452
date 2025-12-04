# Travel Planner Frontend

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
- REACT_APP_PLACES_PROVIDER=openstreetmap|mapbox|google (default: openstreetmap)
- REACT_APP_NOMINATIM_URL (optional, default https://nominatim.openstreetmap.org)
- REACT_APP_MAPBOX_TOKEN (optional, for Mapbox provider)
- REACT_APP_GOOGLE_MAPS_API_KEY (optional, for Google provider - not fully implemented in demo)

Routes:
- The Places tab is within Trip Details. A direct route is also available: /trips/:tripId/places (renders TripDetails with the Places tab).

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
REACT_APP_FEATURE_FLAGS={"FEATURE_BUDGET":true,"ITINERARY_CALENDAR":true,"PLACES_SEARCH":true}
# OR comma-separated:
# REACT_APP_FEATURE_FLAGS=FEATURE_BUDGET,ITINERARY_CALENDAR,PACKING_LIST,PLACES_SEARCH

REACT_APP_EXPERIMENTS_ENABLED=false

# Currency rates (optional)
REACT_APP_EXCHANGE_RATES_URL=https://api.exchangerate.host/latest
REACT_APP_EXCHANGE_RATES_API_KEY=
```

## Usage

- Navigate to a specific trip to view Trip Details.
- Tabs include Itinerary and, when FEATURE_BUDGET is enabled, a Budget tab.
- In Budget:
  - Select a base currency for display.
  - Add expenses with date, description, category, amount, and currency.
  - Review totals and per-category breakdown.
  - Set a planned budget to track remaining amount.
- If the backend provides budget endpoints (see above), the app uses them. Otherwise, it persists budget data in localStorage keyed by tripId.

---
For additional architecture, testing, and theme details, see the existing sections below in this file.
