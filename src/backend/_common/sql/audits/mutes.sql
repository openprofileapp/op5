CREATE TABLE IF NOT EXISTS mutes (
    logId TEXT PRIMARY KEY NOT NULL,
    sourceId TEXT NOT NULL, -- User id
    targetId TEXT NOT NULL, -- User or asset id    
    action TEXT NOT NULL, -- MUTE, UNMUTE
    origin TEXT NOT NULL DEFAULT 'unknown',
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (sourceId, targetId, action, date) -- Ensure audit do not have multiple of the same logs
);