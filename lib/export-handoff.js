// Export current DB state + computed charts as a JSON handoff packet for
// Claude Design. Writes to docs/handoff/sample-data.json.
//
// Run: node lib/export-handoff.js

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, close } from './db.js';
import { computeNatalChart } from './chart.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '..', 'docs', 'handoff', 'sample-data.json');

const people    = (await query('SELECT * FROM people    ORDER BY created_at')).rows;
const events    = (await query('SELECT * FROM events    ORDER BY occurred_at DESC')).rows;
const pings     = (await query('SELECT * FROM pings     ORDER BY pinged_at DESC')).rows;
const predictions = (await query('SELECT * FROM predictions ORDER BY predicted_at DESC')).rows;
const themes    = (await query('SELECT * FROM themes    ORDER BY slug')).rows;

// Compute charts for every person so Claude Design has full chart data to mock against.
const charts = {};
for (const p of people) {
  try {
    charts[p.name] = computeNatalChart(p);
  } catch (e) {
    charts[p.name] = { error: e.message };
  }
}

const packet = {
  generated_at: new Date().toISOString(),
  note: 'Sample data packet for Claude Design handoff. Real entries from the user\'s lab notebook as of the export time.',
  themes,
  people,
  events,
  pings,
  predictions,
  charts,
};

await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, JSON.stringify(packet, null, 2), 'utf-8');

console.log(`Wrote handoff packet to ${path.relative(process.cwd(), outPath)}`);
console.log(`  ${people.length} people, ${events.length} events, ${pings.length} pings, ${predictions.length} predictions`);
console.log(`  ${Object.keys(charts).length} charts computed`);

await close();
