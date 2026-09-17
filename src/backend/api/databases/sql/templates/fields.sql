CREATE TABLE IF NOT EXISTS fields (
    blockId TEXT NOT NULL,
    fieldId TEXT PRIMARY KEY NOT NULL,
    rowId TEXT NOT NULL,
    type TEXT,
    label TEXT,
    placeholder TEXT,
    options TEXT DEFAULT '[]',
    guide TEXT,
    isLocked INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    addedCount INTEGER NOT NULL DEFAULT 0,
    createdBy TEXT NOT NULL,
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
