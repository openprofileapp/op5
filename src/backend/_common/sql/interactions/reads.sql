CREATE TABLE IF NOT EXISTS reads (
    sourceId TEXT NOT NULL, -- User or socket id
    targetId TEXT NOT NULL, -- Asset id
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (sourceId, targetId, date) -- Ensure source/target do not have multiple of the same interactions
);