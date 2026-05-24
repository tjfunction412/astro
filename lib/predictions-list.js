// List predictions, with optional verdict filter.
// Run: npm run predictions:list [-- --status pending|hit|miss|partial|unclear] [-n 50]

import { parseArgs } from 'node:util';
import { listPredictions } from './notebook.js';
import { close } from './db.js';

const { values } = parseArgs({
  options: {
    status: { type: 'string', short: 's' },
    limit:  { type: 'string', short: 'n' },
  },
});

const limit = parseInt(values.limit ?? '20', 10);
const predictions = await listPredictions({ verdictFilter: values.status ?? null, limit });

if (predictions.length === 0) {
  console.log(values.status
    ? `No predictions with status "${values.status}".`
    : 'No predictions logged yet.');
} else {
  console.log(`${predictions.length} ${predictions.length === 1 ? 'prediction' : 'predictions'}${values.status ? ` (${values.status})` : ''}:\n`);

  // Running Brier average for scored predictions
  const scored = predictions.filter((p) => p.brier_score != null);
  if (scored.length > 0) {
    const avg = scored.reduce((sum, p) => sum + Number(p.brier_score), 0) / scored.length;
    console.log(`  Avg Brier (n=${scored.length}): ${avg.toFixed(3)}   (lower = better; 0.25 = no-info baseline at p=0.5)\n`);
  }

  const fmtDate = (d) => {
    if (d == null) return '?';
    return d instanceof Date ? d.toISOString().slice(0, 10) : d;
  };

  for (const p of predictions) {
    const predAt = p.predicted_at.toISOString().slice(0, 10);
    const probStr = p.probability != null ? `  p=${p.probability}` : '';
    const window = p.window_start || p.window_end
      ? `  window: ${fmtDate(p.window_start)}→${fmtDate(p.window_end)}`
      : '';
    const verdictTag = `[${p.verdict}]`;
    const brier = p.brier_score != null ? `  Brier ${Number(p.brier_score).toFixed(3)}` : '';
    const person = p.person_name ? ` (${p.person_name})` : '';

    console.log(`  ${predAt}  ${verdictTag}${probStr}${brier}${person}`);
    console.log(`    transit:    ${p.transit_summary}`);
    console.log(`    prediction: ${p.prediction_text}`);
    if (window) console.log(`   ${window}`);
    if (p.verdict_text) console.log(`    verdict:    ${p.verdict_text}`);
    console.log(`    id: ${p.id}`);
    console.log('');
  }
}

await close();
