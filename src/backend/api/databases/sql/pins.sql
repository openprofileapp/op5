CREATE TABLE IF NOT EXISTS pins (
    ownerId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (ownerId, assetId)
);
