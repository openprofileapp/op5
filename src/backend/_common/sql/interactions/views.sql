CREATE TABLE IF NOT EXISTS views (
    sourceId TEXT NOT NULL, -- User or socket id
    targetId TEXT NOT NULL, -- User or asset id
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);