/**
 * setup.js — Global test setup (must export a `setup` function for Vitest).
 * Deletes and recreates the test SQLite database with full schema + seed data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const here = path.dirname(fileURLToPath(import.meta.url));
// Match the path resolution in database.js:
// server/src/db/ → resolve(here, '../../..') → backend/
// But setup.js is at server/tests/, so:
// server/tests/ → resolve(here, '../..') → backend/
const backendRoot = path.resolve(here, '../..');

function resolveDbPath(dbPath) {
  if (path.isAbsolute(dbPath)) return dbPath;
  // database.js resolves relative to backendRoot (backend/)
  return path.resolve(backendRoot, dbPath);
}

export async function setup() {
  const dbPath = resolveDbPath(
    process.env.DATABASE_PATH ?? './data/kaamconnect-test.sqlite'
  );

  // Ensure directory exists
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  // Delete stale test DB so every run starts fresh
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  // Apply full schema
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  const schemaPath = path.resolve(backendRoot, 'database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  // Seed service categories required by tests
  db.prepare(`
    INSERT OR IGNORE INTO service_categories (name, slug, service_type, icon)
    VALUES
      ('Electrician',   'electrician',   'temporary', '⚡'),
      ('Plumber',       'plumber',       'temporary', '🔧'),
      ('Carpenter',     'carpenter',     'temporary', '🪵'),
      ('House Cleaner', 'house-cleaner', 'temporary', '🧹'),
      ('Painter',       'painter',       'temporary', '🎨'),
      ('AC Technician', 'ac-technician', 'temporary', '❄️')
  `).run();

  db.close();
  console.log('✅ [setup] Test database initialized at', dbPath);
}
