CREATE TABLE IF NOT EXISTS connections (
    userId TEXT NOT NULL,
    connectionId TEXT PRIMARY KEY NOT NULL,
    connectionName TEXT NOT NULL,
    isMfa INTEGER NOT NULL DEFAULT 0
        CHECK (isMfa IN (0, 1)),
    connectedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);