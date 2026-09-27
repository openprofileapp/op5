CREATE TABLE IF NOT EXISTS published_blocks (
    assetId TEXT NOT NULL,
    blockId TEXT PRIMARY KEY NOT NULL,
    categoryId TEXT NOT NULL,
    icon TEXT,
    label TEXT,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0
);
