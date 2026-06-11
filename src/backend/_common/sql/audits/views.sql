CREATE TABLE IF NOT EXISTS views (
    logId TEXT PRIMARY KEY NOT NULL,
    sourceId TEXT NOT NULL, -- User or socket id
    targetIdOrUrl TEXT NOT NULL, -- User or asset id or URL
    action TEXT NOT NULL, -- VIEW, READ
    referer TEXT NOT NULL DEFAULT 'unknown',
    duration INTEGER NOT NULL DEFAULT 0,
    disconnectedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (sourceId, targetIdOrUrl, action, disconnectedDate) -- Ensure audit do not have multiple of the same logs
);