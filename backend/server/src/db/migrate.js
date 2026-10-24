/**
 * migrate.js — apply the canonical schema and any incremental migrations.
 *
 * The schema.sql uses CREATE TABLE IF NOT EXISTS throughout, making it safe
 * to run on an existing database. The schema_migrations table records which
 * migrations have been applied so they are never run twice.
 *
 * Usage: node server/src/db/migrate.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './database.js';

const here = path.dirname(fileURLToPath(import.meta.url));

// ── 1. Apply the canonical schema (idempotent) ──────────────────────────────
const schemaPath = path.resolve(here, '../../../database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);
console.log('✅  Canonical schema applied.');

// ── 2. Discover and run incremental migration files ─────────────────────────
const migrationsDir = path.resolve(here, '../../../database/migrations');
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

// Ensure the bookkeeping table exists even on a first-time empty DB
// (schema.sql already creates it, but guard here for safety)
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id         TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const isApplied = db.prepare('SELECT 1 FROM schema_migrations WHERE id = ?');
const recordMigration = db.prepare(
  'INSERT INTO schema_migrations (id) VALUES (?)'
);

let applied = 0;
for (const file of migrationFiles) {
  const id = file; // use filename as the stable migration id
  if (isApplied.get(id)) {
    console.log(`  ↩  Already applied: ${id}`);
    continue;
  }

  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const runMigration = db.transaction(() => {
    db.exec(sql);
    recordMigration.run(id);
  });

  try {
    runMigration();
    console.log(`  ✅  Applied migration: ${id}`);
    applied++;
  } catch (err) {
    console.error(`  ❌  Failed migration: ${id}\n`, err);
    db.close();
    process.exit(1);
  }
}

if (applied === 0 && migrationFiles.length > 0) {
  console.log('  ℹ️  All migrations already applied — nothing to do.');
} else if (migrationFiles.length === 0) {
  console.log('  ℹ️  No incremental migration files found.');
}

console.log('✅  Migration complete.');
db.close();
