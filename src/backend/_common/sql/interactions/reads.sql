CREATE TABLE IF NOT EXISTS reads (
    source TEXT NOT NULL, -- User or socket id
    target TEXT NOT NULL, -- Asset id
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (source, target, date) -- Ensure source/target do not have multiple of the same interactions
);