// Apply schema.sql to the database. Idempotent.
// Run: npm run migrate

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, close } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '..', 'schema.sql');

const sql = await fs.readFile(schemaPath, 'utf-8');
await pool.query(sql);

console.log(`Applied ${path.basename(schemaPath)} to database.`);
await close();
