CREATE TABLE IF NOT EXISTS blocks (
    blockId TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    categoryType TEXT NOT NULL,
    icon TEXT,
    label TEXT,
    description TEXT,
    tags TEXT DEFAULT '[]',
    source TEXT NOT NULL DEFAULT 'community',
    uses INTEGER NOT NULL DEFAULT 0,
    isRecommended INTEGER NOT NULL DEFAULT 0,
    isSensitive INTEGER NOT NULL DEFAULT 0,
    isMature INTEGER NOT NULL DEFAULT 0,
    addedCount INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'public',
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
