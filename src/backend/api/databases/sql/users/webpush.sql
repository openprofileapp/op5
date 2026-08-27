CREATE TABLE IF NOT EXISTS webpush (
    userId TEXT NOT NULL,
    endpoint TEXT UNIQUE,
    keys TEXT UNIQUE,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (userId, endpoint, keys)
);