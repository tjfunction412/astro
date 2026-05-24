// Assign a verdict to a prediction. Computes Brier score automatically when
// a probability was set on the prediction.
//
// Run: npm run predictions:verdict -- --id <uuid> --status hit|miss|partial|unclear [--text "..."]

import { parseArgs } from 'node:util';
import { setPredictionVerdict } from './notebook.js';
import { close } from './db.js';

const { values } = parseArgs({
  options: {
    id:     { type: 'string' },
    status: { type: 'string', short: 's' },
    text:   { type: 'string', short: 't' },
    help:   { type: 'boolean', short: 'h' },
  },
});

const VALID = new Set(['hit', 'miss', 'partial', 'unclear']);

if (values.help || !values.id || !VALID.has(values.status)) {
  console.log(`
Assign verdict to a prediction. Brier score computed automatically if probability was set.

Required:  --id <uuid>
           --status   one of: hit, miss, partial, unclear
Optional:  --text     (your notes on what actually happened)

Outcomes used for Brier:
  hit      → 1
  miss     → 0
  partial  → 0.5
  unclear  → excluded from Brier (still recorded as verdict)

Example:
  npm run predictions:verdict -- --id 567bac13-... --status partial --text "work pressure hit, identity stuff didn't"
`);
  process.exit(values.help ? 0 : 1);
}

const pred = await setPredictionVerdict({
  id: values.id,
  verdict: values.status,
  verdict_text: values.text ?? null,
});

console.log(`Updated: ${pred.id}`);
console.log(`  Verdict: ${pred.verdict}`);
if (pred.verdict_text) console.log(`  Notes: ${pred.verdict_text}`);
if (pred.brier_score != null) console.log(`  Brier: ${Number(pred.brier_score).toFixed(3)}`);
else if (pred.probability == null) console.log(`  (No probability was set — no Brier score)`);
else if (pred.verdict === 'unclear') console.log(`  (Verdict 'unclear' excluded from Brier)`);

await close();
