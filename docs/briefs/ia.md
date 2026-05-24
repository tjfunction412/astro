# Information Architecture Brief

The webapp's surfaces, their purposes, their data, and their relationships. Locks the scope for Claude Design to mock against.

## Mental model

**Today** is the hub. Everything else is a spoke. The user opens the app and sees the present moment — current sky, recent pings, open predictions, anything alive — and drills into specific surfaces from there.

The MCP server mirrors the same operations programmatically. Claude on any surface (Code, Desktop) can do what the webapp does, conversationally. The webapp is the *visual companion*; the MCP is the *programmatic interface*. Same Neon backend.

## Surfaces

### 1. Today
**Purpose:** Single-screen present-moment readout. The default landing surface.
**Primary device:** Mobile, with desktop adaptation.
**Shows:**
- Current sky (10 planets + key points, sign + degree + retrograde marker)
- The tightest aspects from today's sky to the user's natal chart (top 3, with orb)
- The most recent 3-5 pings (mood, energy, brief note)
- Any open predictions whose window is currently active
- Quick-add affordance for a new ping
**Actions:** Drop a ping; jump to Calendar; jump to a specific chart.
**Visual register:** Radar-scope feel. Live, current, compact.

### 2. Calendar
**Purpose:** Time dimension made legible. Browse past, present, and approaching transits alongside logged events and pings.
**Primary device:** Desktop-primary; mobile gets a week-view instead of month-grid.
**Shows:**
- Monthly grid where each day cell shows:
  - Notable transits (icons/symbols for major aspects exact that day)
  - Any events logged on that day
  - Any pings (mood color hint)
  - Open or active predictions whose window covers the day
- Navigation: month forward/back, jump to today, jump to a date
- Filter: by theme, by person, by event vs. ping vs. transit
**Actions:** Click a day to expand its detail; drop a prediction for a future transit; log an event for a past date.
**Visual register:** Instrument schedule grid. Dense, scan-friendly, color-coded.

### 3. Chart
**Purpose:** View any person's natal chart in full detail.
**Primary device:** Desktop; mobile shows a vertical-stack version.
**Shows:**
- Radar-scope chart wheel (planets/points around perimeter, aspect lines through interior, current transits overlaid in distinct shade)
- Planet table: name, sign+degree, house, retrograde status
- Asteroid/TNO/Point tables (collapsible sections)
- House cusps with active house system noted
- Aspects panel: close (≤3° orb) by default, expandable to wider
- Person selector (dropdown of people)
- House system switcher (Placidus default, Whole Sign, Equal, Koch, etc.)
**Actions:** Switch person; switch house system; toggle transit overlay.
**Visual register:** The most visually iconic surface. The chart wheel is the signature visual.

### 4. People
**Purpose:** Manage the people tracked in the database.
**Primary device:** Desktop-primary; mobile is a stripped-down list.
**Shows:**
- List of all people with name, relation, birth date, MBTI (if set), notes preview
- Add Person form (name, relation, birth date/time/place/lat/lon/tz, notes, MBTI)
- Per-person detail view: full birth data + notes + link to their Chart
**Actions:** Add, edit, delete, view chart.
**Visual register:** Quiet, utilitarian. Index of beings.

### 5. Notebook
**Purpose:** Browseable, searchable log of events, pings, and predictions.
**Primary device:** Desktop-primary; mobile shows simplified scrolling list.
**Shows:**
- Three tabs or sections: Events, Pings, Predictions
- Each entry with timestamp, content, tags/themes, person if applicable
- Search by text, filter by theme, filter by date range, filter by person
- Brier score running average for scored predictions
**Actions:** Add new entry; edit recent entries (within edit window); view single entry detail.
**Visual register:** Terminal log / captain's log. Monospace timestamps. Dense, scrollable.

### 6. Predictions
**Purpose:** Workflow surface for the prediction lifecycle — register, monitor, verdict.
**Primary device:** Either; mobile-friendly.
**Shows:**
- Open predictions (window not yet closed)
- Pending verdicts (window closed but not yet verdicted)
- Recently verdicted with their Brier scores
- Running Brier average and calibration plot (probability vs. outcome)
- Stopping rule progress (if user set one)
**Actions:** Register new prediction; mark verdict on a pending one; see detail.
**Visual register:** Scientific results display. Numerics prominent. Calibration plot as a small instrument.

### 7. Reference
**Purpose:** Archetype reference panels — planets, signs, houses, aspects, minor bodies.
**Primary device:** Desktop-primary; mobile is searchable list.
**Shows:**
- Markdown-rendered definitions (from repo `definitions/`)
- Per-archetype: name, glyph, classical correspondences, modern psychological reading, what it represents at a glance
- Cross-references between related archetypes
**Actions:** Search; jump to a specific archetype; edit (writes to markdown files via Git on the dev side).
**Visual register:** Field guide / index. Quieter than the live surfaces. Type-led.

### 8. Settings
**Purpose:** Configuration that doesn't belong elsewhere.
**Primary device:** Desktop-primary.
**Shows:**
- Default house system
- Default aspect orbs (per aspect type)
- Theme of UI (light/dark, though dark is the default)
- Ephemeris file paths (if local) / data sources
- Brier score baseline + stopping rule configuration
- MCP server connection details (URL + bearer for the user's own deploy)
**Actions:** Adjust each setting.
**Visual register:** Form-led, minimal.

## Routing (Next.js app-router shape)

```
/                  → Today
/calendar          → Calendar
/calendar/[date]   → Day detail
/chart             → Default person's chart
/chart/[name]      → Specific person's chart
/people            → People list
/people/[id]       → Person detail
/notebook          → Notebook (defaults to Events tab)
/notebook/events   → Events log
/notebook/pings    → Pings log
/notebook/predictions → Predictions log
/predictions       → Prediction workflow surface
/reference         → Reference index
/reference/[slug]  → Archetype detail
/settings          → Settings
```

## Surface ↔ MCP tool mapping

Each surface has equivalent operations via MCP. Below is the high-level mapping; full tool specs live in `mcp.md`.

| Surface | MCP tools used |
|---|---|
| Today | `today_transits`, `transit_to_natal`, `list_pings`, `list_predictions`, `log_ping` |
| Calendar | `today_transits`, `list_events`, `list_pings`, `list_predictions` |
| Chart | `compute_chart`, `get_person`, `transit_to_natal` |
| People | `add_person`, `list_people`, `get_person` |
| Notebook | `list_events`, `list_pings`, `list_predictions`, `log_event`, `log_ping` |
| Predictions | `register_prediction`, `list_predictions`, `verdict_prediction` |
| Reference | (none — static markdown) |
| Settings | (no MCP equivalent for v1) |

## Mobile vs. desktop priorities

Mobile-primary surfaces: **Today, Calendar (week-view), People (list), Predictions**.
Desktop-primary surfaces: **Chart, Notebook, Reference, Settings**.

Mobile-primary surfaces must work well on small screens at full information density. Desktop-primary surfaces should still be *legible* on mobile but won't be optimized for it.

## What's NOT in v1

- Multi-person synastry view (Chart × Chart aspect calc — exists in the lib but not surfaced)
- Calendar export / iCal
- Notifications / push reminders
- Sharing / collaboration features
- Public reading-sharing surfaces
- Pluto-generation / Strauss-Howe overlay (might land in Chart or Reference later)
- Year-in-review at solar return
- Blind-retro UI (workflow stays conversational via MCP/Claude)
