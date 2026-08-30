CREATE TABLE IF NOT EXISTS webpush (
    userId TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    keys TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (userId, endpoint)
);
