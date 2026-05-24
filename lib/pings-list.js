// List recent pings.
// Run: npm run pings:list

import { parseArgs } from 'node:util';
import { listPings } from './notebook.js';
import { close } from './db.js';

const { values } = parseArgs({
  options: {
    limit: { type: 'string', short: 'n' },
  },
});

const limit = parseInt(values.limit ?? '20', 10);
const pings = await listPings({ limit });

if (pings.length === 0) {
  console.log('No pings logged yet.');
} else {
  console.log(`${pings.length} ${pings.length === 1 ? 'ping' : 'pings'}:\n`);
  for (const p of pings) {
    const when = p.pinged_at.toISOString().slice(0, 16).replace('T', ' ');
    const energy = p.energy != null ? `  ⚡${p.energy}/5` : '';
    const tags = p.tags?.length ? `  [${p.tags.join(', ')}]` : '';
    console.log(`  ${when}  ${p.mood}${energy}${tags}`);
    if (p.note) console.log(`    ${p.note}`);
    console.log('');
  }
}

await close();
