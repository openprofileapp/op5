CREATE TABLE IF NOT EXISTS restricts (
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (source, target)
);
