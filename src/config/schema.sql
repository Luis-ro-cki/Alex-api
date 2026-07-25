-- Esquema de base de datos de Alex API
-- Motor: SQLite (better-sqlite3)

CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  plan            TEXT NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  avatar_color    TEXT NOT NULL DEFAULT '#7C5CFF',
  reset_token     TEXT,
  reset_token_expires INTEGER,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'Default Key',
  key             TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'active', -- 'active' | 'revoked'
  created_at      INTEGER NOT NULL,
  last_used_at    INTEGER
);

CREATE TABLE IF NOT EXISTS request_logs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  api_key_id      INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint        TEXT NOT NULL,
  method          TEXT NOT NULL,
  status_code     INTEGER NOT NULL,
  ip              TEXT,
  duration_ms     INTEGER,
  created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_monthly (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period          TEXT NOT NULL, -- formato 'YYYY-MM'
  count           INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, period)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON request_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage_monthly(user_id, period);
