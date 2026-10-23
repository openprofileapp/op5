CREATE TABLE IF NOT EXISTS published (
    assetId TEXT NOT NULL,
    text TEXT,
    addedBy TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (assetId, addedBy, date)
);
