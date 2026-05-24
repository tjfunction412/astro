// CRUD for the people table.

import { query } from './db.js';

export async function listPeople() {
  const { rows } = await query(
    'SELECT * FROM people ORDER BY created_at DESC',
  );
  return rows;
}

export async function getPersonByName(name) {
  const { rows } = await query(
    'SELECT * FROM people WHERE lower(name) = lower($1) LIMIT 1',
    [name],
  );
  return rows[0] ?? null;
}

export async function addPerson({
  name,
  relation = null,
  birth_date,
  birth_time = null,
  birth_tz,
  birth_place,
  birth_lat,
  birth_lon,
  notes = null,
}) {
  const { rows } = await query(
    `INSERT INTO people
       (name, relation, birth_date, birth_time, birth_tz, birth_place, birth_lat, birth_lon, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, relation, birth_date, birth_time, birth_tz, birth_place, birth_lat, birth_lon, notes],
  );
  return rows[0];
}
