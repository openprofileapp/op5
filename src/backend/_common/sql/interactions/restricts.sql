CREATE TABLE IF NOT EXISTS restricts (
    sourceId TEXT NOT NULL, -- User id
    targetId TEXT NOT NULL, -- User id
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);