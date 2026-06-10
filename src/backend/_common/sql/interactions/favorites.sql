CREATE TABLE IF NOT EXISTS favorites (
    sourceId TEXT NOT NULL, -- User id
    targetId TEXT NOT NULL, -- Asset id
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);