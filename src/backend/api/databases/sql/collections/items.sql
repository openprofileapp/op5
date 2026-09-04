CREATE TABLE IF NOT EXISTS items (
    collectionId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    addedBy TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (collectionId, assetId)
);
