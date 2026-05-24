// Print everyone in the people table. Doubles as a connection smoke test.
// Run: npm run people:list

import { listPeople } from './people.js';
import { close } from './db.js';

const people = await listPeople();

if (people.length === 0) {
  console.log('No people in the database yet.');
} else {
  console.log(`${people.length} ${people.length === 1 ? 'person' : 'people'}:\n`);
  for (const p of people) {
    const date = p.birth_date instanceof Date
      ? p.birth_date.toISOString().slice(0, 10)
      : p.birth_date;
    const time = p.birth_time ?? '(time unknown)';
    const rel = p.relation ? ` [${p.relation}]` : '';
    console.log(`  ${p.name}${rel}`);
    console.log(`    ${date} ${time} ${p.birth_tz}`);
    console.log(`    ${p.birth_place} (${p.birth_lat}, ${p.birth_lon})`);
    if (p.notes) console.log(`    note: ${p.notes}`);
    console.log('');
  }
}

await close();
