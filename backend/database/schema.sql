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
-- Customer service requests
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_requests (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_category_id INTEGER NOT NULL REFERENCES service_categories(id),
  title               TEXT    NOT NULL,
  description         TEXT,
  budget              INTEGER,
  address             TEXT,
  pincode             TEXT,
  preferred_date      TEXT,
  preferred_time      TEXT,
  status              TEXT    NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  selected_worker_id  INTEGER REFERENCES worker_profiles(id),
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON service_requests (customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status   ON service_requests (status);
CREATE INDEX IF NOT EXISTS idx_service_requests_worker   ON service_requests (selected_worker_id);

-- ─────────────────────────────────────────────
-- Bookings
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id  INTEGER NOT NULL REFERENCES service_requests(id),
  customer_id         INTEGER NOT NULL REFERENCES users(id),
  worker_id           INTEGER NOT NULL REFERENCES worker_profiles(id),
  status              TEXT    NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','accepted','en_route','arrived',
                                        'in_progress','completed','cancelled','disputed')),
  scheduled_date      TEXT,
  scheduled_time      TEXT,
  actual_start        TEXT,
  actual_end          TEXT,
  final_amount        INTEGER,
  cancellation_reason TEXT,
  cancelled_by        TEXT    CHECK (cancelled_by IS NULL OR cancelled_by IN ('customer','worker','admin')),
  otp_code            TEXT,
  otp_expires_at      TEXT,
  otp_verified        INTEGER NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker   ON bookings (worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_request  ON bookings (service_request_id);

-- ─────────────────────────────────────────────
-- Booking status history (audit trail)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_status_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id  INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT    NOT NULL,
  changed_by  INTEGER REFERENCES users(id),
  reason      TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking ON booking_status_history (booking_id);

-- ─────────────────────────────────────────────
-- Reviews
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id  INTEGER NOT NULL UNIQUE REFERENCES bookings(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  worker_id   INTEGER NOT NULL REFERENCES worker_profiles(id),
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_worker   ON reviews (worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews (reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking  ON reviews (booking_id);

-- ─────────────────────────────────────────────
-- IVR sessions (provider-independent workflow state)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ivr_sessions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT    NOT NULL UNIQUE,        -- external provider session identifier
  caller_phone    TEXT    NOT NULL,
  state           TEXT    NOT NULL DEFAULT 'welcome'
                  CHECK (state IN ('welcome','language','service_select','confirm',
                                   'connect_worker','completed','error')),
  language        TEXT,
  selected_service TEXT,
  linked_request_id INTEGER REFERENCES service_requests(id),
  metadata        TEXT,                           -- JSON blob for provider-specific data
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ivr_sessions_session ON ivr_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_ivr_sessions_phone   ON ivr_sessions (caller_phone);

-- ─────────────────────────────────────────────
-- Sessions (server-side, express-session compatible)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  sid     TEXT    PRIMARY KEY,
  sess    TEXT    NOT NULL,
  expired TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions (expired);
