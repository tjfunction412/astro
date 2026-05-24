// Pre-register a prediction about an upcoming transit.
// Run: npm run predictions:add -- --transit "..." --text "..." [--probability 0.7] [--themes ...] [--start ...] [--end ...] [--person ...]

import { parseArgs } from 'node:util';
import { addPrediction } from './notebook.js';
import { getPersonByName } from './people.js';
import { close } from './db.js';

const { values } = parseArgs({
  options: {
    transit:     { type: 'string' },  // short summary, e.g. "Saturn sq natal Sun, exact ~2026-06-15"
    text:        { type: 'string' },  // 1-3 themes you expect to activate
    probability: { type: 'string' },  // 0.00 - 1.00 (optional; rigor mode)
    themes:      { type: 'string' },  // comma-separated theme slugs (optional)
    start:       { type: 'string' },  // window_start YYYY-MM-DD
    end:         { type: 'string' },  // window_end YYYY-MM-DD
    person:      { type: 'string' },  // person's name (default: self)
    help:        { type: 'boolean', short: 'h' },
  },
});

const usage = `
Pre-register a prediction. Time-locked: writing this BEFORE the transit perfects
is the methodological move that makes the lab notebook honest.

Required:  --transit (short summary)
           --text    (1-3 themes you expect to activate)
Optional:  --probability  (0.00-1.00; enables Brier scoring at verdict)
           --themes       (comma-separated slugs; what areas of life)
           --start        (YYYY-MM-DD window_start)
           --end          (YYYY-MM-DD window_end)
           --person       (name; defaults to self)

Example:
  npm run predictions:add -- \\
    --transit "Saturn square natal Sun, exact 2026-06-15" \\
    --text "expect work pressure + identity questioning" \\
    --probability=0.65 \\
    --themes work,inner \\
    --start 2026-06-01 --end 2026-06-30
`;

if (values.help || !values.transit || !values.text) {
  console.log(usage);
  process.exit(values.help ? 0 : 1);
}

const probability = values.probability != null ? parseFloat(values.probability) : null;
if (probability != null && (Number.isNaN(probability) || probability < 0 || probability > 1)) {
  console.error('--probability must be between 0.00 and 1.00');
  process.exit(1);
}

const predicted_themes = values.themes?.split(',').map((t) => t.trim()).filter(Boolean) ?? null;

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

const pred = await addPrediction({
  transit_summary: values.transit,
  prediction_text: values.text,
  probability,
  predicted_themes,
  person_id,
  window_start: values.start ?? null,
  window_end:   values.end ?? null,
});

console.log(`Registered: ${pred.id}`);
console.log(`  Transit: ${pred.transit_summary}`);
console.log(`  Prediction: ${pred.prediction_text}`);
if (probability != null) console.log(`  Probability: ${probability}`);
if (predicted_themes) console.log(`  Themes: ${predicted_themes.join(', ')}`);
if (values.start || values.end) console.log(`  Window: ${values.start ?? '?'} → ${values.end ?? '?'}`);
console.log(`\nWhen the window closes, run:\n  npm run predictions:verdict -- --id ${pred.id} --status hit|miss|partial|unclear`);

await close();
