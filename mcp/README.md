# astro-mcp

MCP server exposing a personal astrology lab notebook to any Claude surface (Code, Desktop, custom Agent SDK apps). Single-user per deploy. Bearer auth. Backed by Neon Postgres.

## What it does

Twelve tools, thin wrappers over the parent project's compute and data layers:

- **People:** `add_person`, `list_people`, `get_person`
- **Chart:** `compute_chart`, `today_transits`, `transit_to_natal`
- **Lab notebook:** `log_event`, `list_events`, `log_ping`, `list_pings`, `register_prediction`, `list_predictions`, `verdict_prediction`

See `../docs/briefs/mcp.md` for the design rationale and `../docs/briefs/voice.md` for the tone these tools follow when describing themselves to Claude.

## Two transport modes

### Stdio mode (recommended for Claude Desktop)

Claude Desktop spawns the server as a child process and talks to it over stdin/stdout. No HTTP server, no bearer needed (the parent process is already trusted).

Add to Claude Desktop's `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "astro": {
      "command": "node",
      "args": [
        "<absolute path>/astro/mcp/server.js",
        "--stdio"
      ]
    }
  }
}
```

Restart Claude Desktop. The 12 astro tools appear in the MCP tool list.

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### HTTP mode (long-running server, multi-client)

Run as a standalone process. Useful if you want the server reachable from multiple Claude surfaces, from a webapp, or from a remote deploy (Vercel).

```bash
# from astro/ root
MCP_BEARER=any-string-you-pick npm run mcp:start
```

Server boots on `http://localhost:3333`. Endpoints:
- `POST /mcp` — MCP protocol (requires `Authorization: Bearer <MCP_BEARER>`)
- `GET /health` — health check (no auth)

Add to your Claude MCP config (Claude Code or Desktop versions that support HTTP MCP):

```json
{
  "mcpServers": {
    "astro": {
      "url": "http://localhost:3333/mcp",
      "headers": { "Authorization": "Bearer any-string-you-pick" }
    }
  }
}
```

`MCP_BEARER` is read from environment. For local dev any string works; for any deployment reachable from the internet, generate a strong random token (`openssl rand -hex 32`).

## Self-hosting (for friends who want their own)

1. **Fork or clone the repo.**
2. **Create a Neon project** (free tier is plenty). Copy the `DATABASE_URL`.
3. **Bootstrap the schema** locally: paste the connection string into `astro/.env`, then `npm install && npm run migrate` from the repo root. This creates the people, themes, events, pings, predictions, and controls tables.
4. **Deploy `mcp/` to Vercel** (when Vercel adapter lands — see roadmap below). Set environment vars on Vercel:
   - `DATABASE_URL` — your Neon string
   - `MCP_BEARER` — a strong random token you generate (`openssl rand -hex 32`)
5. **Add the deployment URL + bearer to your Claude MCP config** (same shape as the local-dev example above, with your Vercel URL instead of localhost).
6. **Talk to your astrology from anywhere.** Add your natal chart, log pings, register predictions, ask Claude to read transits against your chart.

## Schema

The full schema lives in `../schema.sql` and is applied with `npm run migrate`. It's idempotent — safe to re-run.

## Ephemeris files

The chart compute needs Swiss Ephemeris data files in `../ephemeris/`:

- `seas_18.se1` (~223 KB) and `sepl_18.se1` (~484 KB) — from the [Swiss Ephemeris GitHub mirror](https://github.com/aloistr/swisseph) at `ephe/`
- `se90377s.se1` (Sedna) and `s136199s.se1` (Eris) — from [Alois Treindl's Dropbox](https://www.dropbox.com/scl/fo/y3naz62gy6f6qfrhquu7u?rlkey=ejltdhb262zglm7eo6yfj2940&dl=0) at `long_ast/ast90/` and `long_ast/ast136/`

These are gitignored. The server skips bodies whose files are missing, so partial setups still work — you just lose Eris and Sedna if you skip the Treindl downloads.

## Auth

Every request to `/mcp` requires:

```
Authorization: Bearer <MCP_BEARER>
```

Requests without it return 401. The bearer is configured per-deployment via environment variable; share it only with your own Claude clients.

## Roadmap

Out of scope for v1, planned for later:
- **Vercel adapter** — the current Express setup runs on any Node host. A Vercel-functions adapter is a small lift to write.
- **Synastry tools** — `synastry_aspects(person_a, person_b)` once the cross-chart compute lands.
- **Controls / blind-retro tools** — dedicated tools for the confirmation-bias-defense workflow. For v1 the blind retro stays conversational (Claude reads events without transits, narrates, then reveals).
- **OAuth** — only relevant if a shared/multi-tenant deployment ever becomes interesting. Single-user bearer is right for now.

## Distribution philosophy

This is built **distributable from day one**. Every config goes through env vars. No hardcoded paths, no assumed identity. A friend who likes astrology and has a Vercel account should be able to stand up their own instance with their own data in an afternoon.

That goal shapes how the codebase is structured. If something is hard to share, that's a bug.
