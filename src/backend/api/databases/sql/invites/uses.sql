CREATE TABLE IF NOT EXISTS uses (
    userId TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);