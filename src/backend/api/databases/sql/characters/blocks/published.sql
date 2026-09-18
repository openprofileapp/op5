CREATE TABLE IF NOT EXISTS published_blocks (
    assetId TEXT NOT NULL,
    blockId TEXT PRIMARY KEY NOT NULL,
    categoryId TEXT NOT NULL,
    sourceBlockId TEXT,
    isSourceBlockConnected INTEGER NOT NULL DEFAULT 0,
    icon TEXT,
    label TEXT,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0
);
