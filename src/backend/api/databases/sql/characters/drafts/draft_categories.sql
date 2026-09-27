CREATE TABLE IF NOT EXISTS draft_categories (
    assetId TEXT NOT NULL,
    categoryId TEXT PRIMARY KEY NOT NULL,
    types TEXT NOT NULL DEFAULT '[]',
    label TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    createdBy TEXT NOT NULL,
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
