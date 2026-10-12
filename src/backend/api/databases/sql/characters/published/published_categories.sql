CREATE TABLE IF NOT EXISTS published_categories (
    assetId TEXT NOT NULL,
    categoryId TEXT PRIMARY KEY NOT NULL,
    types TEXT NOT NULL DEFAULT '[]',
    label TEXT,
    position INTEGER NOT NULL DEFAULT 0
);
