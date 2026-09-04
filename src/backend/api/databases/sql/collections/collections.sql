CREATE TABLE IF NOT EXISTS collections (
    algorithmScore INTEGER NOT NULL DEFAULT 0,
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    displayName TEXT,
    avatar TEXT,
    about TEXT,
    tags TEXT DEFAULT '[]',
    isFavorites INTEGER NOT NULL DEFAULT 0,
    isMature INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'private',
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    isDeleted INTEGER NOT NULL DEFAULT 0,
    deletedDate TEXT,

    UNIQUE (ownerId, displayName)
);
