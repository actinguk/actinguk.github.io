-- Acting UK isolated analytics tables, no raw IP addresses or user-agent strings.
CREATE TABLE IF NOT EXISTS au_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  day TEXT NOT NULL,
  kind TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT NOT NULL,
  country TEXT NOT NULL,
  device TEXT NOT NULL,
  daily_visitor TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS au_events_day_kind ON au_events(day,kind);
CREATE INDEX IF NOT EXISTS au_events_day_path ON au_events(day,path);
CREATE TABLE IF NOT EXISTS au_login_attempts (
  key TEXT PRIMARY KEY,
  failures INTEGER NOT NULL,
  window_start INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS au_search_queries (
  query TEXT PRIMARY KEY,
  clicks INTEGER NOT NULL,
  impressions INTEGER NOT NULL,
  ctr REAL NOT NULL,
  position REAL NOT NULL,
  updated_at TEXT NOT NULL
);
