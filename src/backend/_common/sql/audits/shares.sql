CREATE TABLE IF NOT EXISTS shares (
    logId TEXT PRIMARY KEY NOT NULL,
    sourceId TEXT NOT NULL, -- User or socket id
    targetId TEXT NOT NULL, -- Share id
    action TEXT NOT NULL, -- CREATE, USE
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (sourceId, targetId, action, date) -- Ensure audit do not have multiple of the same logs
);