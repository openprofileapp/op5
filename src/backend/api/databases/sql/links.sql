CREATE TABLE IF NOT EXISTS links (
    assetId TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT NOT NULL,
    previewText TEXT,
    visibility TEXT NOT NULL DEFAULT 'public',
    position INTEGER NOT NULL DEFAULT 0,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (id, name)
);
