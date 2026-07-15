CREATE TABLE IF NOT EXISTS permissions (
    userId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    permissions TEXT DEFAULT '0',
    addedBy TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (userId, assetId)
);