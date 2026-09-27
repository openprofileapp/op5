CREATE TABLE IF NOT EXISTS published_datasets (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    label TEXT,
    description TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    data TEXT NOT NULL DEFAULT '[]',
    source TEXT NOT NULL DEFAULT 'community',
    uses INTEGER NOT NULL DEFAULT 0,
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
