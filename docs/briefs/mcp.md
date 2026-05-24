# MCP Design Brief

The MCP (Model Context Protocol) server that exposes the astro database and compute layer as tools any Claude surface can call. Distributable from day one — designed for the user *and* for the handful of close people who might self-host their own.

## Philosophy

**Distributable from day one.** Every config goes through env vars. Every doc assumes a stranger is reading it. README is a first-class artifact. The deploy story is one of the deliverables, not an afterthought. The cost of writing this in from the start is small; the cost of refactoring for sharability later is real.

**Single-user per deploy.** No multi-tenancy. Each user runs their own MCP instance, pointed at their own Neon project. The schema and code are what's shared, not the database. Auth scopes a single bearer to a single deployment; that bearer is configured per Claude-side install.

**Thin wrapper, not reinvention.** The MCP exposes the existing `lib/` functions (chart, people, notebook, aspects, transits) as tools. Adding tools = wrapping a function. No new compute logic; the protocol is a transport layer.

## Architecture

- **Transport**: HTTP/SSE. Remote access from any Claude surface (Code, Desktop, future).
- **Hosting**: Vercel functions (Hobby is fine for personal use; Pro if commercial volume ever happens). Stateless per request; state lives in Neon.
- **Backend**: Neon Postgres. Same DB the CLI scripts and (eventual) webapp talk to. Connection string from `DATABASE_URL` env.
- **Auth**: Bearer token via `Authorization: Bearer <token>` header. The deployment generates or receives a `MCP_BEARER` env var; Claude clients are configured with the same value.
- **Ephemeris files**: Bundled in the deploy. `seas_18.se1`, `sepl_18.se1`, `se90377s.se1`, `s136199s.se1` go in the build artifact. Vercel's 50 MB compressed deployment cap is well above the ~700 KB total.
- **Stateless**: No in-memory user state. Each tool call opens (and reuses pooled) Neon connection, does its work, returns.

## Tool surface (v1)

Twelve tools. All thin wrappers over `lib/`.

### People
```
add_person(name, relation?, birth_date, birth_time?, birth_tz, birth_place,
           birth_lat, birth_lon, notes?, mbti?) → Person
```
Add a person to the people table. Returns the created record.

```
list_people(limit?) → Person[]
```
List people, most recent first.

```
get_person(name_or_id) → Person | null
```
Look up by name (case-insensitive) or UUID.

### Chart
```
compute_chart(person_name, house_system?) → Chart
```
Compute the natal chart: planets, asteroids, TNOs, points, angles, houses, within-natal aspects. `house_system` is a single Swiss Ephemeris code (P=Placidus default, K=Koch, W=whole sign, E=equal, R=Regiomontanus, C=Campanus).

```
today_transits() → Transits
```
Return the current sky: planet positions with retrograde markers, formatted longitudes.

```
transit_to_natal(person_name) → TransitAspects
```
Compute current sky's aspects to a person's natal chart. Returns aspects sorted by tightness, with body pairs and orbs.

### Lab notebook — events
```
log_event(description, occurred_at?, themes?, person_name?) → Event
```
Log a life event. `occurred_at` defaults to now (ISO timestamp). `themes` is an array of theme slugs.

```
list_events(limit?, since?, person_name?, themes?) → Event[]
```
List events, optionally filtered by date, person, or theme.

### Lab notebook — pings
```
log_ping(mood, energy?, note?, tags?) → Ping
```
Drop a quick state ping. `energy` is 1-5. `tags` is an array of theme slugs.

```
list_pings(limit?, since?) → Ping[]
```
List recent pings.

### Lab notebook — predictions
```
register_prediction(transit_summary, prediction_text, probability?,
                    predicted_themes?, person_name?, window_start?, window_end?)
                    → Prediction
```
Pre-register a prediction. If `probability` is provided (0.00-1.00), Brier scoring will compute at verdict time.

```
list_predictions(status?, limit?) → Prediction[]
```
List predictions, optionally filtered by verdict status (pending, hit, miss, partial, unclear).

```
verdict_prediction(id, status, verdict_text?) → Prediction
```
Assign a verdict. If probability was registered, Brier score computes automatically (hit=1, miss=0, partial=0.5, unclear excluded).

## Voice in tool descriptions

Tool descriptions are read by Claude when deciding which to call. They follow `voice.md` — direct, plain, useful. No marketing. Examples:

✅ `compute_chart` — "Compute the natal chart for a person already in the DB. Returns 10 planets, 5 asteroids, 2 TNOs, 4 points (N. Node, Lilith, Vertex, Fortune), angles, houses, and within-natal aspects."

❌ `compute_chart` — "Unveil the cosmic blueprint of any soul in your sacred database."

## Auth

### v1: Bearer token
- Deploy generates or accepts a `MCP_BEARER` env var
- All MCP requests require `Authorization: Bearer <token>` header
- Claude clients (Code, Desktop) are configured with the same token in their MCP config
- Simple, sufficient for self-hosted single-user

### Future: OAuth
If a shared/multi-user deployment ever becomes interesting, Google OAuth is the natural next step. Out of scope for v1.

### What auth protects
- All write operations (add, log, register, verdict)
- All read operations too (the data is personal)

There's no anonymous endpoint. The server returns 401 on any unauthenticated request.

## Repo structure

**For v1: same repo as the astro project**, with the MCP server in a `mcp/` subdirectory. Deploy from `mcp/` on Vercel.

```
astro/
├── lib/             # Shared logic (chart, people, notebook, aspects)
├── mcp/             # MCP server (Vercel-deployable)
│   ├── server.js    # Tool definitions + handler
│   ├── auth.js      # Bearer middleware
│   ├── package.json # Vercel deploy config
│   └── README.md    # Setup story for friends
├── docs/briefs/
└── ...
```

**Plan: extract `astro-mcp` as its own repo at distribution time.** The first version is for you to run. Extraction happens when you're ready to share with friends — at that point the MCP repo gets its own README, deploy template, and lifecycle.

## Setup story (six steps for a friend)

```
1. Click "Deploy to Vercel" on the README. Forks the repo and starts deploy.
2. Create a Neon project (free tier). Copy the DATABASE_URL.
3. In Vercel project settings:
   - Paste DATABASE_URL into env
   - Generate a strong random string; set as MCP_BEARER env
4. Bootstrap the schema: `npm run migrate` against your new Neon (one time).
5. Add your Vercel deployment URL + bearer to your Claude MCP config:
   {
     "mcpServers": {
       "astro": {
         "url": "https://your-astro-mcp.vercel.app/sse",
         "headers": { "Authorization": "Bearer YOUR_TOKEN" }
       }
     }
   }
6. Done. Talk to your own astrology in any Claude.
```

Saturday afternoon for someone technical. The README should make each step nearly foolproof.

## What stays out of v1

- **Controls/blind-retro dedicated tools** — workflow stays conversational. Claude can read events, write a narrative, and use the chat as the canvas. We add dedicated tools later if it earns them.
- **Synastry tools** — `synastry_aspects(person_a, person_b)` is a natural future tool, but skip for v1.
- **Pluto-generation / Strauss-Howe overlay** — interesting future tool but not v1.
- **Year-in-review at solar return** — future.
- **MCP-side caching** — Neon is fast enough; premature optimization.
- **Rate limiting** — single-user; not needed at v1 scale.
- **OAuth, multi-tenant** — future.

## Implementation notes

- Use the official `@modelcontextprotocol/sdk` package for TypeScript/Node
- HTTP/SSE transport via Vercel functions (Vercel supports SSE on Pro; Hobby has time limits per response that may matter for long-running tool calls — verify before locking architecture)
- Pool Neon connections via the existing `lib/db.js` pattern (already SSL-handled correctly)
- All tool handlers should be async and return JSON-serializable results
- Errors return structured error responses, not stack traces
- Ephemeris files in `mcp/ephemeris/` get bundled into the deploy

## Open questions worth noting (not blockers)

- Vercel Hobby SSE limits — might force Pro or alternative hosting for friends if they want to use Hobby
- Whether Claude Desktop's MCP config supports the bearer-in-header pattern uniformly across versions (verify before docs go out)
- Whether to log every tool call to a `mcp_audit` table for debugging — probably yes, but low priority
