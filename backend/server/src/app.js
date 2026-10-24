/**
 * app.js — Express application factory.
 *
 * Exports createApp() for testability and a default app instance for
 * server.js. Tests can import createApp and pass their own db instance.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { apiRateLimit } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { loadUser } from './middleware/auth.js';
import { db as defaultDb } from './db/database.js';
import { router } from './routes/index.js';

// ── SQLite-backed session store ────────────────────────────────────────────
class SqliteSessionStore extends session.Store {
  constructor(db) {
    super();
    this._db = db;
    // Ensure sessions table exists
    this._db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid     TEXT PRIMARY KEY,
        sess    TEXT NOT NULL,
        expired TEXT NOT NULL
      )
    `);
    this._get     = db.prepare("SELECT sess FROM sessions WHERE sid = ? AND expired > datetime('now')");
    this._set     = db.prepare('INSERT OR REPLACE INTO sessions (sid, sess, expired) VALUES (?, ?, ?)');
    this._destroy = db.prepare('DELETE FROM sessions WHERE sid = ?');
    this._prune   = db.prepare("DELETE FROM sessions WHERE expired < datetime('now')");
    // Prune expired sessions every 5 minutes
    const interval = setInterval(() => { try { this._prune.run(); } catch {} }, 5 * 60 * 1000);
    if (interval.unref) interval.unref();
  }
  get(sid, cb) {
    try {
      const row = this._get.get(sid);
      cb(null, row ? JSON.parse(row.sess) : null);
    } catch (e) { cb(e); }
  }
  set(sid, data, cb) {
    try {
      const maxAge = data.cookie?.maxAge ?? 7 * 24 * 60 * 60 * 1000;
      const expired = new Date(Date.now() + maxAge).toISOString().replace('T', ' ').slice(0, 19);
      this._set.run(sid, JSON.stringify(data), expired);
      cb(null);
    } catch (e) { cb(e); }
  }
  destroy(sid, cb) {
    try { this._destroy.run(sid); cb(null); } catch (e) { cb(e); }
  }
}

/**
 * createApp — build and return a configured Express application.
 * @param {import('better-sqlite3').Database} [db]  Optional DB override for tests.
 */
export function createApp(db = defaultDb) {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — must come before routes
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '512kb' }));

  // Session middleware — SQLite-backed
  app.use(session({
    secret:            env.sessionSecret,
    resave:            false,
    saveUninitialized: false,
    store:             new SqliteSessionStore(db),
    cookie: {
      httpOnly: true,
      secure:   env.isProd,
      sameSite: env.isProd ? 'strict' : 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    },
    name: 'kc.sid',
  }));

  // General API rate limit
  app.use('/api', apiRateLimit);

  // Load authenticated user for all requests
  app.use(loadUser);

  // All API routes
  app.use('/api', router);

  // 404 → error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Default app instance used by server.js
const app = createApp();
export default app;
