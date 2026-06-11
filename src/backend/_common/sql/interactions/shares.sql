CREATE TABLE IF NOT EXISTS shares (
    sourceId TEXT NOT NULL, -- User or socket id
    targetId TEXT NOT NULL, -- User or asset id
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (sourceId, targetId) -- Ensure source/target do not have multiple of the same interactions
);