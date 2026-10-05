CREATE TABLE IF NOT EXISTS published (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    displayName TEXT,
    about TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    source TEXT NOT NULL DEFAULT 'community',
    uses INTEGER NOT NULL DEFAULT 0,
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
