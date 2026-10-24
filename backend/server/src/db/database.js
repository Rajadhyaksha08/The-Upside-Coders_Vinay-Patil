import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve an absolute path for the SQLite database file.
 * When DATABASE_PATH is relative it is resolved from the backend root
 * (two levels above server/src/db/) so that `./data/kaamconnect.sqlite`
 * always lands at backend/data/ regardless of the cwd.
 */
function resolveDbPath(dbPath) {
  if (path.isAbsolute(dbPath)) return dbPath;
  // backend root = server/src/db/ → ../../.. → backend/
  const backendRoot = path.resolve(here, '../../..');
  return path.resolve(backendRoot, dbPath);
}

const dbPath = resolveDbPath(env.databasePath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
