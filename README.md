# Travel Planner Pro

A web application that helps users plan their trips, organize itineraries, and manage travel details.

## Containers

- travel_planner_frontend
  - React-based web UI
  - See travel_planner_frontend/README.md for full setup, environment variables, architecture, and development instructions.

### Quick start (frontend)
- cd travel_planner_frontend
- npm install
- npm start

## Theme

The frontend applies the Ocean Professional theme via src/theme/ocean.css and a global import in src/index.css. See the frontend README for variable overrides and utility class references.

## New: Packing List (feature flagged)

The frontend includes a categorized Packing List with per-category and overall progress.

- Feature flag: PACKING_LIST (default enabled)
- Fallback: persists to localStorage when backend endpoints are not available
- Integrated into Trip Details as a "Packing" tab

## New: Budget Planner (feature flagged)

The frontend now includes a Budget Planner in the Trip Details page that lets users:
- Track expenses with add/edit/delete
- Set a trip budget target and see progress
- View category breakdown via a lightweight chart

How to enable:
- Set environment variable in the frontend: REACT_APP_FEATURE_FLAGS=FEATURE_BUDGET
- See travel_planner_frontend/README.md for details on endpoints and usage.

Expected backend endpoints:
- GET/POST/PATCH/DELETE /trips/:tripId/expenses
- GET/PATCH /trips/:tripId/budget
