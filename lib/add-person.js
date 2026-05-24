// Add a person to the people table from CLI flags.
// Run: node lib/add-person.js --name "Alice" --date 1992-03-14 ...
// Or:  npm run people:add -- --name "Alice" --date 1992-03-14 ...

import { parseArgs } from 'node:util';
import { addPerson } from './people.js';
import { close } from './db.js';

const { values } = parseArgs({
  options: {
    name:     { type: 'string' },
    relation: { type: 'string' },
    date:     { type: 'string' }, // YYYY-MM-DD
    time:     { type: 'string' }, // HH:MM (24-hour, optional)
    tz:       { type: 'string' }, // IANA, e.g. America/New_York
    place:    { type: 'string' },
    lat:      { type: 'string' },
    lon:      { type: 'string' },
    notes:    { type: 'string' },
    help:     { type: 'boolean', short: 'h' },
  },
});

const usage = `
Add a person to the people table.

Required:  --name --date --tz --place --lat --lon
Optional:  --time --relation --notes

NOTE: For negative values (e.g. western longitudes), use --flag=value form:
  --lon=-122.6784   (not   --lon -122.6784)

Example (Bash):
  node lib/add-person.js \\
    --name "Alice" \\
    --relation sister \\
    --date 1992-03-14 \\
    --time 14:22 \\
    --tz America/Los_Angeles \\
    --place "Portland, OR" \\
    --lat 45.5152 \\
    --lon=-122.6784 \\
    --notes "Tracking Saturn return"

Example (PowerShell — backtick continuation):
  node lib/add-person.js \`
    --name "Alice" \`
    --date 1992-03-14 \`
    --tz America/Los_Angeles \`
    --place "Portland, OR" \`
    --lat 45.5152 \`
    --lon=-122.6784
`;

if (values.help) {
  console.log(usage);
  process.exit(0);
}

const required = ['name', 'date', 'tz', 'place', 'lat', 'lon'];
const missing = required.filter((field) => !values[field]);
if (missing.length > 0) {
  console.error(`Missing required: ${missing.join(', ')}`);
  console.error(usage);
  process.exit(1);
}

const person = await addPerson({
  name:        values.name,
  relation:    values.relation ?? null,
  birth_date:  values.date,
  birth_time:  values.time ?? null,
  birth_tz:    values.tz,
  birth_place: values.place,
  birth_lat:   parseFloat(values.lat),
  birth_lon:   parseFloat(values.lon),
  notes:       values.notes ?? null,
});

console.log(`Added: ${person.name} (id: ${person.id})`);
await close();
