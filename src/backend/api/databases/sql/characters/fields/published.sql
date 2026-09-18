CREATE TABLE IF NOT EXISTS published_fields (
    assetId TEXT NOT NULL,
    fieldId TEXT PRIMARY KEY NOT NULL,
    rowId TEXT NOT NULL,
    flex INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL,
    label TEXT,
    position INTEGER NOT NULL DEFAULT 0
);
