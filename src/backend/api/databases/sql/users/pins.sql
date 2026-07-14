CREATE TABLE IF NOT EXISTS pins (
    assetId TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    note TEXT,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);