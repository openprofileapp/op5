CREATE TABLE IF NOT EXISTS drafts (
    assetId TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    credit TEXT,
    position INTEGER NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'default',
    addedBy TEXT NOT NULL,
    addedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (assetId, url)
);
