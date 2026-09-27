CREATE TABLE IF NOT EXISTS published_categories (
    assetId TEXT NOT NULL,
    categoryId TEXT PRIMARY KEY NOT NULL,
    label TEXT,
    position INTEGER NOT NULL DEFAULT 0
);
