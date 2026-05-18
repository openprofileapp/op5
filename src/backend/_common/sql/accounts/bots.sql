CREATE TABLE IF NOT EXISTS bots (
    id TEXT PRIMARY KEY NOT NULL,
    token TEXT NOT NULL,
    ownerId TEXT NOT NULL,
    displayName TEXT,
    about TEXT,
    permissions TEXT DEFAULT '0',
    lastActive TEXT,
    isSuspended INTEGER NOT NULL DEFAULT 0
        CHECK (isSuspended IN (0, 1)),
    isDeleted INTEGER NOT NULL DEFAULT 0
        CHECK (isDeleted IN (0, 1)),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);