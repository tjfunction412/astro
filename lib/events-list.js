// List recent events.
// Run: npm run events:list

import { parseArgs } from 'node:util';
import { listEvents } from './notebook.js';
import { close } from './db.js';

const { values } = parseArgs({
  options: {
    limit: { type: 'string', short: 'n' },
  },
});

const limit = parseInt(values.limit ?? '20', 10);
const events = await listEvents({ limit });

if (events.length === 0) {
  console.log('No events logged yet.');
} else {
  console.log(`${events.length} ${events.length === 1 ? 'event' : 'events'}:\n`);
  for (const e of events) {
    const when = e.occurred_at.toISOString().slice(0, 16).replace('T', ' ');
    const themes = e.themes?.length ? ` [${e.themes.join(', ')}]` : '';
    const person = e.person_name ? ` (with ${e.person_name})` : '';
    console.log(`  ${when}${themes}${person}`);
    console.log(`    ${e.description}`);
    console.log('');
  }
}

await close();
