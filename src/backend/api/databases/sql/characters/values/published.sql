CREATE TABLE IF NOT EXISTS published_values (
    assetId TEXT NOT NULL,
    fieldId TEXT NOT NULL,
    content TEXT,

    UNIQUE (assetId, fieldId)
);
