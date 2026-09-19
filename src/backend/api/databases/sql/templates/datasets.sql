CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    label TEXT,
    description TEXT,
    data TEXT NOT NULL DEFAULT '[]',
    source TEXT NOT NULL DEFAULT 'community',
    uses INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'public',
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
