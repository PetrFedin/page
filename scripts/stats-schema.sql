-- База статистики syntha.pro (Cloudflare D1). Применяется один раз:
--   npx wrangler@4.141.0 d1 execute syntha-stats --remote --file=scripts/stats-schema.sql
CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,
  vid     TEXT,
  sid     TEXT,
  type    TEXT NOT NULL,
  path    TEXT,
  target  TEXT,
  label   TEXT,
  data    TEXT,
  lang    TEXT,
  country TEXT,
  city    TEXT,
  org     TEXT,
  device  TEXT,
  browser TEXT,
  os      TEXT,
  ref     TEXT,
  ip      TEXT
);
CREATE INDEX IF NOT EXISTS ev_ts   ON events (ts);
CREATE INDEX IF NOT EXISTS ev_vid  ON events (vid, ts);
CREATE INDEX IF NOT EXISTS ev_type ON events (type, ts);

CREATE TABLE IF NOT EXISTS submissions (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts        INTEGER NOT NULL,
  vid       TEXT,
  sid       TEXT,
  name      TEXT,
  email     TEXT,
  telegram  TEXT,
  phone     TEXT,
  entity    TEXT,
  topic     TEXT,
  message   TEXT,
  lang      TEXT,
  file_name TEXT,
  country   TEXT,
  city      TEXT,
  ok        INTEGER
);
CREATE INDEX IF NOT EXISTS sub_ts ON submissions (ts);
