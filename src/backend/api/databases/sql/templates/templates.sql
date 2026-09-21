CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    displayName TEXT,
    about TEXT,
    source TEXT NOT NULL DEFAULT 'community',
    uses INTEGER NOT NULL DEFAULT 0,
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    isDeleted INTEGER NOT NULL DEFAULT 0,
    deletedDate TEXT
);
