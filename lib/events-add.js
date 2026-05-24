// Add an event to the log.
// Run: npm run events:add -- --description "..." [--date 2026-05-22] [--themes work,creative] [--person "Alice"]

import { parseArgs } from 'node:util';
import { addEvent } from './notebook.js';
import { getPersonByName } from './people.js';
import { close } from './db.js';

const { values } = parseArgs({
  options: {
    description: { type: 'string', short: 'd' },
    date:        { type: 'string' },             // ISO timestamp or YYYY-MM-DD; defaults to now
    themes:      { type: 'string' },             // comma-separated theme slugs
    person:      { type: 'string', short: 'p' }, // person's name
    help:        { type: 'boolean', short: 'h' },
  },
});

if (values.help || !values.description) {
  console.log(`
Add an event to the lab notebook.

Required:  --description
Optional:  --date (ISO timestamp or YYYY-MM-DD, defaults to now)
           --themes (comma-separated slugs: work,body,love,family,creative,money,social,inner,synchronicity)
           --person (name lookup)

Example:
  npm run events:add -- --description "Started new job at Cascade" --themes work --date 2026-05-22
`);
  process.exit(values.help ? 0 : 1);
}

const occurred_at = values.date ?? new Date().toISOString();
const themes = values.themes?.split(',').map((t) => t.trim()).filter(Boolean) ?? null;

let person_id = null;
if (values.person) {
  const p = await getPersonByName(values.person);
  if (!p) {
    console.error(`No person found with name "${values.person}".`);
    await close();
    process.exit(1);
  }
  person_id = p.id;
}

const event = await addEvent({ occurred_at, description: values.description, themes, person_id });
const when = event.occurred_at instanceof Date
  ? event.occurred_at.toISOString().slice(0, 16).replace('T', ' ')
  : event.occurred_at;
const themeStr = event.themes?.length ? ` [${event.themes.join(', ')}]` : '';
console.log(`Logged: ${when}${themeStr}  ${event.description}`);
await close();
