CREATE TABLE IF NOT EXISTS mutes (
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0,
    isIndefinite INTEGER NOT NULL DEFAULT 0,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (source, target)
);
