CREATE TABLE IF NOT EXISTS draft_fields (
    assetId TEXT NOT NULL,
    fieldId TEXT PRIMARY KEY NOT NULL,
    rowId TEXT NOT NULL,
    flex INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL,
    label TEXT,
    placeholder TEXT,
    options TEXT DEFAULT '[]',
    guide TEXT,
    isLocked INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    createdBy TEXT NOT NULL,
    lastEditedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
