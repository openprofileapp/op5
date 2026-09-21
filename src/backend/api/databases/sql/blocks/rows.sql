CREATE TABLE IF NOT EXISTS rows (
    blockId TEXT NOT NULL,
    rowId TEXT PRIMARY KEY NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    createdBy TEXT NOT NULL,
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
