// Lab-notebook CRUD: events, pings, predictions, controls.
// Pure data access — printing and CLI parsing live in the *-add / *-list scripts.

import { query } from './db.js';

// ---------- EVENTS ----------

export async function addEvent({ occurred_at, description, themes = null, person_id = null }) {
  const { rows } = await query(
    `INSERT INTO events (occurred_at, description, themes, person_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [occurred_at, description, themes, person_id],
  );
  return rows[0];
}

export async function listEvents({ limit = 20 } = {}) {
  const { rows } = await query(
    `SELECT e.*, p.name AS person_name
       FROM events e LEFT JOIN people p ON p.id = e.person_id
      ORDER BY e.occurred_at DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

// ---------- PINGS ----------

export async function addPing({ mood, energy = null, note = null, tags = null, pinged_at = null }) {
  const { rows } = await query(
    `INSERT INTO pings (mood, energy, note, tags, pinged_at)
     VALUES ($1, $2, $3, $4, COALESCE($5, now()))
     RETURNING *`,
    [mood, energy, note, tags, pinged_at],
  );
  return rows[0];
}

export async function listPings({ limit = 20 } = {}) {
  const { rows } = await query(
    'SELECT * FROM pings ORDER BY pinged_at DESC LIMIT $1',
    [limit],
  );
  return rows;
}

// ---------- PREDICTIONS ----------

export async function addPrediction({
  transit_summary,
  prediction_text,
  probability = null,
  predicted_themes = null,
  person_id = null,
  window_start = null,
  window_end = null,
}) {
  const { rows } = await query(
    `INSERT INTO predictions
       (transit_summary, prediction_text, probability, predicted_themes,
        person_id, window_start, window_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [transit_summary, prediction_text, probability, predicted_themes,
     person_id, window_start, window_end],
  );
  return rows[0];
}

export async function listPredictions({ verdictFilter = null, limit = 20 } = {}) {
  const conds = [];
  const params = [];
  if (verdictFilter) {
    params.push(verdictFilter);
    conds.push(`verdict = $${params.length}`);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  params.push(limit);
  const { rows } = await query(
    `SELECT p.*, pe.name AS person_name
       FROM predictions p LEFT JOIN people pe ON pe.id = p.person_id
       ${where}
       ORDER BY p.predicted_at DESC
       LIMIT $${params.length}`,
    params,
  );
  return rows;
}

// Brier score: (probability - outcome)^2.
// hit=1, miss=0, partial=0.5, unclear=null (excluded from scoring).
function brierFor(probability, verdict) {
  if (probability == null) return null;
  const outcome =
    verdict === 'hit'     ? 1 :
    verdict === 'miss'    ? 0 :
    verdict === 'partial' ? 0.5 :
    null;
  if (outcome == null) return null;
  return Math.pow(Number(probability) - outcome, 2);
}

export async function setPredictionVerdict({ id, verdict, verdict_text = null }) {
  // Fetch first so we can compute Brier
  const { rows: existing } = await query('SELECT probability FROM predictions WHERE id = $1', [id]);
  if (existing.length === 0) {
    throw new Error(`No prediction with id ${id}`);
  }
  const brier = brierFor(existing[0].probability, verdict);

  const { rows } = await query(
    `UPDATE predictions
        SET verdict = $1,
            verdict_text = $2,
            verdict_at = now(),
            brier_score = $3
      WHERE id = $4
      RETURNING *`,
    [verdict, verdict_text, brier, id],
  );
  return rows[0];
}
