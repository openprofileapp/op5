CREATE TABLE IF NOT EXISTS fields (
    blockId TEXT NOT NULL,
    rowId TEXT NOT NULL,
    fieldId TEXT PRIMARY KEY NOT NULL,
    flex INTEGER NOT NULL DEFAULT 1,
    type TEXT,
    label TEXT,
    placeholder TEXT,
    dataset TEXT,
    guide TEXT,
    isLocked INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    createdBy TEXT NOT NULL,
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
