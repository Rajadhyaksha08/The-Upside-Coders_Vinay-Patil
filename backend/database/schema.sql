PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS service_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  service_type TEXT NOT NULL CHECK (service_type IN ('temporary', 'tenure')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Identity/auth tables will be added in a reviewed migration before auth implementation.
-- Do not store real personal data in demo seed records.
