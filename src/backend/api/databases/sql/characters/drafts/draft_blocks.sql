CREATE TABLE IF NOT EXISTS draft_blocks (
    assetId TEXT NOT NULL,
    blockId TEXT PRIMARY KEY NOT NULL,
    categoryId TEXT NOT NULL,
    sourceBlockId TEXT,
    isSourceBlockConnected INTEGER NOT NULL DEFAULT 0,
    icon TEXT,
    label TEXT,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    createdBy TEXT NOT NULL,
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
