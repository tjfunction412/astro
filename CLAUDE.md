# Astro

Personal astrology tool. Spiritual successor to The Clockwork Mirror (the dead Replit beta at `../The-Clockwork-Mirror-beta/`). Not a product. Not for shipping. For one user — the developer.

## Voice & posture

The goal is **"alive"** — real ephemeris data feeding real LLM synthesis, not pre-baked templates. The original Clockwork Mirror died because it tried to encode interpretation in templates; this version delegates interpretation to the model at runtime.

When acting as an astrologer: archetypes as vocabulary for self-reflection, not predictive metaphysics. Mars = drive, Saturn = structure, etc. Synthesis over recitation. Conversational, not Oracle-mode. The user finds astrology "rad" within an engagement mode that treats it as a Rorschach for self-reflection — match that register.

Never reach for canned templates. The whole project ethos is *synthesize, don't recite.*

## Stack

- **Language**: Node.js (chosen for stack continuity with the user's other Vercel-deployed work)
- **Ephemeris**: `sweph` npm package (Swiss Ephemeris bindings, AGPL-3.0). Use **Moshier mode** by default — no data files needed, ~0.1" accuracy, plenty for astrology.
- **Database**: Neon Postgres
  - Project: `astro` (PG 18, AWS US East 2 / Ohio)
  - Connection: `DATABASE_URL` in `.env` (gitignored)
  - Default role: `neondb_owner`, default DB: `neondb`
- **Intelligence layer**: Claude Code on Max plan; Claude Agent SDK (also Max auth) for any future programmatic LLM calls. **Do not use paid Anthropic API** — Max underuse is a known sore spot for this user.

## Phased rollout

- **Phase 1 (current)**: Desktop-only. Local Node scripts invoke `sweph`; Claude Code shells out for ephemeris computations during conversation. PG holds people records.
- **Phase 2**: Headless wrappers — scripts that invoke `claude -p` for scheduled jobs (daily reading, etc.).
- **Phase 3**: Android CRUD app → Vercel function (reusing Phase 1's sweph code) → Neon. No LLM in the app itself.
- **Phase 4** (optional): Vercel function exposes an Agent-SDK call as an HTTP endpoint. Android app calls it for on-the-go LLM interpretation. The user's personal "Claude API," funded by the Max subscription.

## Data model

`schema.sql` defines a `people` table with: name, relation, birth_date, birth_time (nullable), birth_tz (IANA), birth_place, birth_lat, birth_lon, notes, plus uuid PK and timestamps. The user's natal chart lives here too — he's just one row.

Apply schema with `npm run migrate` (idempotent). List rows with `npm run people:list`. Add a person with `npm run people:add -- --name ... --date ... --tz ... --place ... --lat ... --lon ...` (see `--help`).

## Constraints

- **Personal use only.** No marketing, no capital, no productization. Don't propose features that pull toward "what if other users."
- **Repo can go public on GitHub** when ready — user is comfortable with that, and public source satisfies the AGPL obligation that comes via sweph.
- **Keep PII out of Git.** Birth data lives in Neon. Never in seed files, never in test fixtures, never in commits.
- **Raw SQL, no ORM.** Matches the user's house style from CF/MIP.

## Notes for the assistant

- The user has internalized these patterns from his production work: read-only DB connections by default, explicit `write_connection()` for writes, allowlists for writable fields, kill switches on any external write integration. Match that posture when the project grows to need it; Phase 1 with a single `neondb_owner` role is fine until then.
- The user is an "aspiring AI-era dev" who's actually shipping serious production software (MIP + ContentForge). Treat him as a peer leveling up, not a beginner.
- Planning-phase decisions from the parent folder's memory (`../.. /memory/astro_successor_plan.md` from the perspective of Claude Code's project memory at `D--CLAUDELAB-clockwork-mirror`) are the source of truth for "why we picked X." If something seems unclear, the planning conversation captured the reasoning.
