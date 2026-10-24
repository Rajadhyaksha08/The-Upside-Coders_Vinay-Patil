-- KaamConnect — canonical schema
-- Applied idempotently by migrate.js using CREATE TABLE IF NOT EXISTS.
-- Migrations that alter existing tables live in database/migrations/.

PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────
-- Migration bookkeeping
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schema_migrations (
  id          TEXT    PRIMARY KEY,
  applied_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────
-- Reference data
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_categories (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL UNIQUE,
  slug          TEXT    NOT NULL UNIQUE,
  service_type  TEXT    NOT NULL CHECK (service_type IN ('temporary', 'tenure')),
  icon          TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────
-- Accounts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,
  phone           TEXT    NOT NULL UNIQUE,   -- normalized: digits only, no country code
  password_hash   TEXT    NOT NULL,
  role            TEXT    NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
  status          TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- ─────────────────────────────────────────────
-- Worker profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS worker_profiles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  city            TEXT    NOT NULL DEFAULT '',
  pincode         TEXT    NOT NULL DEFAULT '',
  bio             TEXT,
  experience      TEXT,
  working_hours   TEXT,
  languages       TEXT    NOT NULL DEFAULT '[]',  -- JSON array, e.g. '["Hindi","English"]'
  hourly_rate     INTEGER,
  fixed_rate      INTEGER,
  rate_type       TEXT    NOT NULL DEFAULT 'hourly' CHECK (rate_type IN ('hourly', 'fixed')),
  aadhaar_verified INTEGER NOT NULL DEFAULT 0,
  platform_verified INTEGER NOT NULL DEFAULT 0,
  jobs_completed  INTEGER NOT NULL DEFAULT 0,
  rating          REAL    NOT NULL DEFAULT 0,
  review_count    INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON worker_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_status  ON worker_profiles (status);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_city    ON worker_profiles (city);

-- ─────────────────────────────────────────────
-- Worker ↔ service associations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS worker_services (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_profile_id     INTEGER NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  service_category_id   INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  UNIQUE (worker_profile_id, service_category_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_services_worker   ON worker_services (worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_worker_services_category ON worker_services (service_category_id);

-- ─────────────────────────────────────────────
-- Worker availability
-- ─────────────────────────────────────────────
-- Allowed statuses: 'available' | 'busy' | 'offline'
CREATE TABLE IF NOT EXISTS worker_availability (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_profile_id INTEGER NOT NULL UNIQUE REFERENCES worker_profiles(id) ON DELETE CASCADE,
  status            TEXT    NOT NULL DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'offline')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_worker_availability_status ON worker_availability (status);

-- ─────────────────────────────────────────────
-- Sessions (server-side, express-session compatible)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  sid     TEXT    PRIMARY KEY,
  sess    TEXT    NOT NULL,
  expired TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions (expired);
