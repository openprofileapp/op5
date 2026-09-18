CREATE TABLE IF NOT EXISTS draft_values (
    assetId TEXT NOT NULL,
    fieldId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    content TEXT,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
