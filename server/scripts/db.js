/**
 * Database setup commands for StudyLoft (Sprint 1, task 21).
 *
 *   npm run db:init    create the tables from src/db/schema.sql (existing tables are kept)
 *   npm run db:seed    add or update the store items from src/db/seed.sql
 *   npm run db:reset   DELETE all tables and data, then create and seed them again
 *                      (for development, e.g. after a schema change; refused in production)
 *
 * The connection string is read from DATABASE_URL: either set in the shell
 * or written in server/.env (copy .env.example to .env).
 *
 * Each command runs in one transaction: either every step succeeds or the
 * database is left unchanged.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..');
const ENV_FILE = path.join(SERVER_DIR, '.env');
const SCHEMA_FILE = path.join(SERVER_DIR, 'src', 'db', 'schema.sql');
const SEED_FILE = path.join(SERVER_DIR, 'src', 'db', 'seed.sql');

// All tables of schema.sql: add a table here when one is added to schema.sql.
// CASCADE also removes their indexes and foreign keys.
const DROP_ALL_TABLES = 'DROP TABLE IF EXISTS inventory, study_sessions, items, users CASCADE;';

const COMMANDS = ['init', 'seed', 'reset'];

/** Reads server/.env if it exists. A value already set in the shell is not overwritten. */
function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    return;
  }
  if (typeof process.loadEnvFile !== 'function') {
    throw new Error(
      'Reading .env needs Node.js 20.12 or newer. Update Node.js or set DATABASE_URL in the shell.',
    );
  }
  process.loadEnvFile(ENV_FILE);
}

/** "localhost:5432/studyloft": where we connect, without the user name or password. */
function describeTarget(connectionString) {
  try {
    const url = new URL(connectionString);
    return `${url.hostname}:${url.port || 5432}${url.pathname}`;
  } catch {
    return '(DATABASE_URL could not be parsed)';
  }
}

async function runFile(client, label, file) {
  console.log(`- ${label} (${path.relative(SERVER_DIR, file)})`);
  await client.query(fs.readFileSync(file, 'utf8'));
}

async function main() {
  const command = process.argv[2];
  if (!COMMANDS.includes(command)) {
    console.error(`Usage: node scripts/db.js <${COMMANDS.join('|')}>`);
    process.exitCode = 1;
    return;
  }

  loadEnvFile();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  }
  if (command === 'reset' && process.env.NODE_ENV === 'production') {
    throw new Error('db:reset deletes all data and is not allowed when NODE_ENV=production.');
  }

  // Loaded here so that the checks above work even before `npm install`.
  const { Client } = require('pg');
  const client = new Client({ connectionString });

  console.log(`db:${command} on ${describeTarget(connectionString)}`);
  await client.connect();
  try {
    await client.query('BEGIN');
    try {
      if (command === 'reset') {
        console.log('- Dropping all tables');
        await client.query(DROP_ALL_TABLES);
      }
      if (command === 'init' || command === 'reset') {
        await runFile(client, 'Creating tables', SCHEMA_FILE);
      }
      if (command === 'seed' || command === 'reset') {
        await runFile(client, 'Adding store items', SEED_FILE);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }

    const result = await client.query('SELECT count(*)::int AS count FROM items');
    console.log(`Done. The store has ${result.rows[0].count} items.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(`Database command failed: ${err.message}`);
  process.exitCode = 1;
});
