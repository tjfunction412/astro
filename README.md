# astro

A personal astrology lab notebook. Pattern-tracking heritage, not energy mysticism. Single-subject longitudinal study, n=1.

Built around a simple thesis: planetary positions can be compared against reportable shifts in lived experience, and with discipline (pre-registered predictions, Brier scoring, blind retrospective controls) you can find out whether the patterns hold up for you specifically. Not for everyone. Not predictively. For yourself, honestly.

Designed to be used *through Claude*. The astrology is real ephemeris; the synthesis is LLM at runtime; the data lives in your Neon Postgres; the lab-notebook discipline is yours. No oracle. No templates. Lab notebook.

## What's in here

- **`lib/`** — Pure functions: chart compute (`chart.js`), aspect math (`aspects.js`), current-sky and transit-to-natal (`sky.js`), DB access (`db.js`), and CRUD for people / events / pings / predictions (`people.js`, `notebook.js`).
- **`mcp/`** — MCP server exposing 12 tools to any Claude surface (Code, Desktop, Agent SDK). Supports stdio (default for Claude Desktop) and HTTP/SSE (for remote/Vercel deploys). See `mcp/README.md` for setup.
- **`schema.sql`** — Neon Postgres schema. Idempotent. `npm run migrate` applies it.
- **`docs/briefs/`** — Architecture, voice, information architecture, visual direction, MCP design. Inputs for the planned webapp (Phase 3).
- **`docs/handoff/sample-data.example.json`** — Fictional data packet, schema-accurate. For design work and demos.
- **CLI scripts** — Direct command-line access to the same functions the MCP exposes. See the `scripts` block in `package.json`.

## Quick start

You'll need: Node 20+, a Neon Postgres project (free tier is plenty), and `psql` if you want to poke directly at the DB.

```bash
# 1. Install
npm install
cd mcp && npm install && cd ..

# 2. Create .env at project root with your Neon connection string
echo "DATABASE_URL=<your-neon-connection-string>" > .env

# 3. Apply schema
npm run migrate

# 4. Download the Swiss Ephemeris data files for full body coverage
#    (Chiron, Big Four asteroids, Eris, Sedna). See mcp/README.md for sources.
#    Without them, the chart still works for the 10 main planets via Moshier.

# 5. Add yourself
npm run people:add -- \
  --name "You" --relation self \
  --date 1990-01-01 --time 12:00 \
  --tz America/New_York \
  --place "Your City, ST" \
  --lat 40.0 --lon=-74.0

# 6. Compute your chart
npm run chart -- --name "You"

# 7. Today's sky
npm run transits
```

## Using it through Claude

The MCP server is the primary interface. Once configured, your Claude (Desktop, Code, or via Agent SDK on Max) can call any of the 12 tools conversationally:

- *"List the people in my astro database."*
- *"What's the sky doing right now?"*
- *"Show me today's transits to my chart."*
- *"Log a ping — mood charged, energy 4, note: late-night build sprint, tags work creative"*
- *"Register a prediction: Saturn square my Sun, exact in 5 days, expect work pressure, probability 0.6, themes work and inner"*
- *"What's my Brier score across scored predictions?"*

Setup details and config locations are in `mcp/README.md`.

## CLI as a fallback

Every operation also has a CLI command:

```
npm run transits                    # current sky
npm run chart -- --name X           # natal chart for X
npm run people:list                 # all tracked people
npm run people:add -- [flags]       # add a person
npm run events:add -- [flags]       # log an event
npm run events:list                 # recent events
npm run pings:add -- [flags]        # log a state ping
npm run pings:list                  # recent pings
npm run predictions:add -- [flags]  # pre-register a prediction
npm run predictions:list            # all predictions (Brier average shown)
npm run predictions:verdict -- ...  # close a prediction; Brier auto-computes
npm run handoff:export              # export real data for backup (gitignored)
```

Run any with `-- --help` for flag details.

## Methodology

The lab notebook is a small experiment in honest n-of-1 self-tracking against astrology:

- **Pre-register predictions** before transits perfect, with optional probability (0.00–1.00) to enable Brier scoring.
- **Verdict afterward** — hit / miss / partial / unclear. Brier scores accumulate; a calibration plot becomes available as data piles up.
- **Track null cases** — log pings and events even during quiet sky periods. Asymmetric attention is the single biggest confirmation-bias risk in self-tracking.
- **Blind retrospective controls** (workflow stays conversational for v1) — Claude reads a past month's events without seeing transit data, generates a plausible astrological narrative, then you reveal the transits and rate fit. Forer/Barnum effect made visible.

If the patterns don't beat a naive base-rate model over 50+ scored predictions, that's a real result. The point isn't to confirm; it's to find out honestly.

## License

GNU Affero General Public License v3. See `LICENSE` for full text and `NOTICE` for third-party attributions (Swiss Ephemeris in particular).

AGPL means: if you self-host this and let other people use the service, you have to make the source available to those users. Public repo satisfies that. If you fork this project, your fork has the same obligation.

## Status

Personal project, day-one tool for the author. Not affiliated with any astrology service, school, or vendor. The code is the artifact; the inquiry is the point.
