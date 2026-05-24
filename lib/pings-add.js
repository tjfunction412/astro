// Drop a quick state ping. Designed to take ~30 seconds.
// Run: npm run pings:add -- --mood charged [--energy 4] [--note "..."] [--tags work,inner]

import { parseArgs } from 'node:util';
import { addPing } from './notebook.js';
import { close } from './db.js';

const { values } = parseArgs({
  options: {
    mood:   { type: 'string', short: 'm' },
    energy: { type: 'string', short: 'e' },         // 1-5
    note:   { type: 'string', short: 'n' },
    tags:   { type: 'string', short: 't' },         // comma-separated slugs
    help:   { type: 'boolean', short: 'h' },
  },
});

if (values.help || !values.mood) {
  console.log(`
Drop a quick state ping. Low-friction: just answer a single field and move on.

Required:  --mood   (heavy / light / charged / calm / mixed — or anything that fits)
Optional:  --energy (1-5)
           --note   (one sentence; what's alive)
           --tags   (comma-separated theme slugs)

Example:
  npm run pings:add -- --mood charged --energy 4 --note "buzzing — finished the chart compute"
`);
  process.exit(values.help ? 0 : 1);
}

const energy = values.energy ? parseInt(values.energy, 10) : null;
const tags = values.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? null;

const ping = await addPing({ mood: values.mood, energy, note: values.note ?? null, tags });
const energyStr = ping.energy != null ? `  energy ${ping.energy}/5` : '';
const tagStr = ping.tags?.length ? `  [${ping.tags.join(', ')}]` : '';
console.log(`Pinged: ${ping.mood}${energyStr}${tagStr}${ping.note ? `\n  ${ping.note}` : ''}`);
await close();
