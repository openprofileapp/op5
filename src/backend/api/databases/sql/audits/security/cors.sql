CREATE TABLE IF NOT EXISTS cors (
    id TEXT PRIMARY KEY NOT NULL,
    source TEXT NOT NULL,
    target TEXT,
    action TEXT NOT NULL,
    changes TEXT,
    origin TEXT NOT NULL DEFAULT 'unknown',
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (source, target, action, date)
);
