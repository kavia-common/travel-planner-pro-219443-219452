# Travel Planner Frontend

This is the React-based UI for Travel Planner Pro.

## Vibrant Theme

The app uses a Vibrant, colorful theme with centralized CSS variables and utilities.

Palette:
- Primary: #7C3AED (Violet 600)
- Secondary: #F97316 (Orange 500)
- Success: #10B981 (Emerald 500)
- Error: #EF4444 (Red 500)
- Info: #06B6D4 (Cyan 500)
- Background: #FFF7ED (Orange 50)
- Surface: #FFFFFF
- Text: #0F172A (Slate 900)
- Gradient: Violet/Fuchsia/Orange blend

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

## Trip Templates

The frontend includes a **Trip Templates** feature that lets users start a new trip from curated presets (e.g. Weekend Getaway, Business Trip, Family Vacation).

Implementation details:

- Template data lives entirely in the frontend at:
  - `src/features/templates/templates.js`
- Each template follows the `TripTemplate` structure (documented via JSDoc in that file):
  - `id` – stable string identifier (e.g. `weekend-getaway`)
  - `name` – display name
  - `description` – short summary
  - `recommendedDurationDays` – number of days to preselect when building dates
  - `tags` – free-form tags used for badges and potential filtering
  - `days` – array of day objects `{ dayIndex, title, notes, activities[] }`
    - each `activities[]` entry has `{ time, title, category, durationMins }` (minutes to keep units explicit)

To add a new template:

1. Open `src/features/templates/templates.js`.
2. Append a new object to the exported `TRIP_TEMPLATES` array, following the existing examples.
3. Ensure `id` is unique and stable – changing it later will break any bookmarks referencing it.
4. Keep `durationMins` in minutes for all activities so downstream logic can safely calculate totals.
5. Optional: include 3–7 activities per day to keep previews readable.

Feature flag control:

- Trip templates are controlled by the `TEMPLATES` flag, which is **on by default**.
- To explicitly disable templates in an environment, set:
  - `REACT_APP_FEATURE_FLAGS=templates=false` (comma-separated format), or
  - `REACT_APP_TEMPLATES=false` (dedicated env).
- When disabled, the UI entry points for choosing templates are hidden.

User experience:

- From the **Trips** page, click:
  - **New Trip** (if the Trip Wizard feature is enabled), or
  - **Blank Trip** or **Choose a Template** when the wizard is disabled.
- Choosing a template opens a picker modal with cards for:
  - Weekend Getaway
  - Business Trip
  - Family Vacation
- After selecting, a **draft trip** is pre-populated with:
  - Title (template name)
  - Start/end dates (based on today + `recommendedDurationDays`)
  - Day-by-day activities (shown in a Trip Preview section)
- The pre-filled details can be edited before saving the trip.

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
REACT_APP_FEATURE_FLAGS={"FEATURE_BUDGET":true,"ITINERARY_CALENDAR":true,"PLACES_SEARCH":true,"FEATURE_NOTIFICATIONS":true,"REMINDERS":true,"BROWSER_NOTIFICATIONS":true,"PDF_EXPORT":true}
# OR comma-separated:
# REACT_APP_FEATURE_FLAGS=FEATURE_BUDGET,ITINERARY_CALENDAR,PACKING_LIST,PLACES_SEARCH,FEATURE_NOTIFICATIONS,REMINDERS,BROWSER_NOTIFICATIONS,PDF_EXPORT

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

## PDF Itinerary Export

Export a beautifully formatted itinerary as a multi-page PDF directly in the browser (offline-capable).

- Where: Trip Details header → Export → Export Itinerary as PDF
- Options: paper size (A4/Letter), orientation (Portrait/Landscape), sections (cover, daily schedule, packing summary, budget summary, map snapshot placeholder), theme (Ocean Professional)
- Pagination with page numbers and crisp text rendering
- Works without backend; all client-side via jsPDF + html2canvas

Feature flag:
- PDF_EXPORT (default: true)
  - Enable/disable via:
    - REACT_APP_PDF_EXPORT=true|false
    - or include in REACT_APP_FEATURE_FLAGS JSON/comma list

Environment example:
- REACT_APP_FEATURE_FLAGS={"PDF_EXPORT": true}

Note: Map snapshot is a placeholder in this build and will be omitted gracefully if not available.

## Development

- npm start
- npm test
- npm run build

## Accessibility & Motion

- Focus states are visible with high-contrast outlines (focus-visible).
- Motion is subtle (150–200ms) and respects prefers-reduced-motion.
