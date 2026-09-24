CREATE TABLE IF NOT EXISTS draft_content (
    assetId TEXT NOT NULL,
    fieldId TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    credit TEXT,
    addedBy TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (assetId, fieldId)
);
