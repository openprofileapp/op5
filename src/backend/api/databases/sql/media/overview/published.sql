CREATE TABLE IF NOT EXISTS published_overview (
    assetId TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    credit TEXT,
    position INTEGER NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'default',
    addedBy TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (assetId, url)
);
