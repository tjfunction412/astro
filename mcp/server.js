// astro-mcp: MCP server exposing the lab notebook + chart compute to any Claude surface.
// Single-user per deploy. Bearer-token auth. Backed by Neon Postgres.

// Env is loaded by ../lib/db.js, which finds the project's .env regardless of cwd.

import express from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const STDIO_MODE = process.argv.includes('--stdio');

import { addPerson, listPeople, getPersonByName } from '../lib/people.js';
import { computeNatalChart } from '../lib/chart.js';
import { getCurrentSky, getTransitsToNatal } from '../lib/sky.js';
import {
  addEvent, listEvents,
  addPing, listPings,
  addPrediction, listPredictions, setPredictionVerdict,
} from '../lib/notebook.js';

// ---------- Config ----------

const MCP_BEARER = process.env.MCP_BEARER;
if (!STDIO_MODE && !MCP_BEARER) {
  console.error('FATAL: MCP_BEARER env var not set. Generate a strong token and set it before starting in HTTP mode.');
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || '3333', 10);

// ---------- Tool helpers ----------

const ok = (value) => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] });
const fail = (message) => ({ content: [{ type: 'text', text: `Error: ${message}` }], isError: true });

async function resolvePerson(name) {
  const person = await getPersonByName(name);
  if (!person) throw new Error(`No person found with name "${name}".`);
  return person;
}

// ---------- MCP Server: tool definitions ----------

const server = new McpServer({ name: 'astro-mcp', version: '0.1.0' });

// People

server.tool(
  'add_person',
  'Add a person to the database. Birth time, notes, MBTI, and relation are optional. Returns the created record.',
  {
    name: z.string().describe('The person\'s name'),
    birth_date: z.string().describe('YYYY-MM-DD'),
    birth_tz: z.string().describe('IANA timezone, e.g. America/New_York'),
    birth_place: z.string().describe('Human-readable location, e.g. Pittsburgh, PA'),
    birth_lat: z.number().describe('Latitude as decimal degrees, negative for south'),
    birth_lon: z.number().describe('Longitude as decimal degrees, negative for west'),
    birth_time: z.string().optional().describe('HH:MM or HH:MM:SS local; omit if unknown'),
    relation: z.string().optional().describe('e.g. self, sister, friend, father'),
    notes: z.string().optional(),
    mbti: z.string().optional(),
  },
  async (args) => {
    try {
      const person = await addPerson(args);
      return ok(person);
    } catch (e) { return fail(e.message); }
  },
);

server.tool(
  'list_people',
  'List all people in the database, most recent first.',
  { limit: z.number().optional().describe('Max rows to return (default 50)') },
  async ({ limit }) => {
    try {
      const people = await listPeople({ limit: limit ?? 50 });
      return ok(people);
    } catch (e) { return fail(e.message); }
  },
);

server.tool(
  'get_person',
  'Look up a person by name (case-insensitive). Returns the full record or null.',
  { name: z.string() },
  async ({ name }) => {
    try {
      const person = await getPersonByName(name);
      return ok(person);
    } catch (e) { return fail(e.message); }
  },
);

// Chart + transits

server.tool(
  'compute_chart',
  'Compute the natal chart for a person already in the DB. Returns 10 planets, 5 asteroids, 2 TNOs, 4 points (N. Node, Lilith, Vertex, Fortune), angles, houses, and within-natal aspects sorted by tightness.',
  {
    person_name: z.string(),
    house_system: z.string().optional().describe('Swiss Ephemeris single-char code. P=Placidus (default), K=Koch, W=whole sign, E=equal, R=Regiomontanus, C=Campanus.'),
  },
  async ({ person_name, house_system }) => {
    try {
      const person = await resolvePerson(person_name);
      const chart = computeNatalChart(person, { houseSystem: house_system ?? 'P' });
      return ok(chart);
    } catch (e) { return fail(e.message); }
  },
);

server.tool(
  'today_transits',
  'Current sky: positions of the 10 planets right now, with retrograde markers and signed longitudinal speed.',
  { at: z.string().optional().describe('Optional ISO datetime string; defaults to now.') },
  async ({ at }) => {
    try {
      const sky = getCurrentSky({ at: at ?? null });
      return ok(sky);
    } catch (e) { return fail(e.message); }
  },
);

server.tool(
  'transit_to_natal',
  'Compute aspects between the current sky and a person\'s natal chart. Returns aspects sorted by tightness, with transit body, natal body, aspect name, and orb. Transit bodies are prefixed "T·" and natal bodies "N·" in the result.',
  {
    person_name: z.string(),
    at: z.string().optional().describe('Optional ISO datetime for the transit moment; defaults to now.'),
  },
  async ({ person_name, at }) => {
    try {
      const person = await resolvePerson(person_name);
      const result = getTransitsToNatal(person, { at: at ?? null });
      return ok(result);
    } catch (e) { return fail(e.message); }
  },
);

// Lab notebook — events

server.tool(
  'log_event',
  'Log a time-stamped life event. Themes is an array of theme slugs (work, body, love, family, creative, money, social, inner, synchronicity).',
  {
    description: z.string(),
    occurred_at: z.string().optional().describe('ISO datetime; defaults to now.'),
    themes: z.array(z.string()).optional(),
    person_name: z.string().optional().describe('Person involved, if any.'),
  },
  async ({ description, occurred_at, themes, person_name }) => {
    try {
      let person_id = null;
      if (person_name) {
        const p = await resolvePerson(person_name);
        person_id = p.id;
      }
      const event = await addEvent({
        description,
        occurred_at: occurred_at ?? new Date().toISOString(),
        themes: themes ?? null,
        person_id,
      });
      return ok(event);
    } catch (e) { return fail(e.message); }
  },
);

server.tool(
  'list_events',
  'List recent events, most recent first.',
  { limit: z.number().optional().describe('Max rows (default 20).') },
  async ({ limit }) => {
    try {
      const events = await listEvents({ limit: limit ?? 20 });
      return ok(events);
    } catch (e) { return fail(e.message); }
  },
);

// Lab notebook — pings

server.tool(
  'log_ping',
  'Drop a quick emotional/energetic state ping. Designed for 30-second capture. Mood is free text (e.g. heavy, light, charged, calm, mixed). Energy is optional 1-5. Tags are theme slugs.',
  {
    mood: z.string(),
    energy: z.number().int().min(1).max(5).optional(),
    note: z.string().optional(),
    tags: z.array(z.string()).optional(),
  },
  async (args) => {
    try {
      const ping = await addPing(args);
      return ok(ping);
    } catch (e) { return fail(e.message); }
  },
);

server.tool(
  'list_pings',
  'List recent pings, most recent first.',
  { limit: z.number().optional().describe('Max rows (default 20).') },
  async ({ limit }) => {
    try {
      const pings = await listPings({ limit: limit ?? 20 });
      return ok(pings);
    } catch (e) { return fail(e.message); }
  },
);

// Lab notebook — predictions

server.tool(
  'register_prediction',
  'Pre-register a prediction about a transit. Time-locking the prediction before the transit perfects is the methodological move that makes the lab notebook honest. If probability is provided (0.00-1.00), Brier scoring will compute at verdict time.',
  {
    transit_summary: z.string().describe('Short summary, e.g. "Saturn square natal Sun, exact ~2026-06-15"'),
    prediction_text: z.string().describe('1-3 themes you expect to activate.'),
    probability: z.number().min(0).max(1).optional(),
    predicted_themes: z.array(z.string()).optional().describe('Theme slugs.'),
    person_name: z.string().optional().describe('Whose chart; default self.'),
    window_start: z.string().optional().describe('YYYY-MM-DD'),
    window_end: z.string().optional().describe('YYYY-MM-DD'),
  },
  async ({ transit_summary, prediction_text, probability, predicted_themes, person_name, window_start, window_end }) => {
    try {
      let person_id = null;
      if (person_name) {
        const p = await resolvePerson(person_name);
        person_id = p.id;
      }
      const pred = await addPrediction({
        transit_summary, prediction_text,
        probability: probability ?? null,
        predicted_themes: predicted_themes ?? null,
        person_id,
        window_start: window_start ?? null,
        window_end: window_end ?? null,
      });
      return ok(pred);
    } catch (e) { return fail(e.message); }
  },
);

server.tool(
  'list_predictions',
  'List predictions, optionally filtered by verdict status.',
  {
    status: z.enum(['pending', 'hit', 'miss', 'partial', 'unclear']).optional(),
    limit: z.number().optional().describe('Max rows (default 20).'),
  },
  async ({ status, limit }) => {
    try {
      const preds = await listPredictions({ verdictFilter: status ?? null, limit: limit ?? 20 });
      return ok(preds);
    } catch (e) { return fail(e.message); }
  },
);

server.tool(
  'verdict_prediction',
  'Assign a verdict to a prediction. If probability was registered, Brier score computes automatically (hit=1, miss=0, partial=0.5, unclear excluded).',
  {
    id: z.string().describe('The prediction\'s UUID.'),
    status: z.enum(['hit', 'miss', 'partial', 'unclear']),
    verdict_text: z.string().optional().describe('Your notes on what actually happened.'),
  },
  async ({ id, status, verdict_text }) => {
    try {
      const pred = await setPredictionVerdict({ id, verdict: status, verdict_text: verdict_text ?? null });
      return ok(pred);
    } catch (e) { return fail(e.message); }
  },
);

// ---------- Transport ----------

if (STDIO_MODE) {
  // stdio mode: the parent process (e.g. Claude Desktop) speaks MCP over our stdin/stdout.
  // No HTTP server, no bearer — the parent process is already trusted.
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server runs until the parent closes our stdio. Don't log to stdout (it's the channel).
  console.error('astro-mcp running in stdio mode');
} else {
  // HTTP mode: long-running Express server with bearer-token auth on /mcp.
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  // Bearer auth — every MCP request requires Authorization: Bearer <MCP_BEARER>
  function requireBearer(req, res, next) {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match || match[1] !== MCP_BEARER) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next();
  }

  // Health check (no auth) — useful for deployment monitoring.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'astro-mcp', version: '0.1.0' });
  });

  // MCP endpoint — single endpoint handles initialization, messages, and SSE notifications.
  app.post('/mcp', requireBearer, async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });
      res.on('close', () => { transport.close(); });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (e) {
      console.error('MCP request error:', e);
      if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.listen(PORT, () => {
    console.log(`astro-mcp listening on http://localhost:${PORT}`);
    console.log(`  MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`  Health check: http://localhost:${PORT}/health`);
    console.log(`  Auth: Bearer ${MCP_BEARER.slice(0, 6)}...${MCP_BEARER.slice(-4)} (don't share)`);
  });
}
