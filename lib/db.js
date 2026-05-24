// Postgres connection helper. Uses Neon via DATABASE_URL from .env.
// SSL is set explicitly in code; we strip sslmode/channel_binding from the URL
// to avoid pg v8's deprecation warning about sslmode=require's future semantics.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import pg from 'pg';

// Load .env from the project root (parent of lib/), regardless of cwd.
// This lets callers in subdirectories (e.g. mcp/) work without symlinks.
// quiet: true suppresses dotenv's stdout "tip" output — critical for MCP
// stdio mode where stdout is the JSON-RPC protocol channel.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set. Check your .env file.');
}

const url = new URL(process.env.DATABASE_URL);
url.searchParams.delete('sslmode');
url.searchParams.delete('channel_binding');

export const pool = new Pool({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: true },  // Neon serves a valid cert chain; verify it.
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function close() {
  await pool.end();
}
