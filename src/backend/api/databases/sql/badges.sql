CREATE TABLE IF NOT EXISTS badges (
    id TEXT NOT NULL,
    type TEXT NOT NULL,
    comment TEXT,
    visibility TEXT NOT NULL DEFAULT 'public',
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (id, type)
);

CREATE INDEX IF NOT EXISTS idxBadgeTypes ON badges (type);
