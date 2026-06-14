CREATE TABLE IF NOT EXISTS restricts (
    source TEXT NOT NULL, -- User id
    target TEXT NOT NULL, -- User id
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (source, target) -- Ensure source/target do not have multiple of the same interactions
);