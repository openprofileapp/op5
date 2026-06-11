CREATE TABLE IF NOT EXISTS mutes (
    sourceId TEXT NOT NULL, -- User id
    targetId TEXT NOT NULL, -- User or asset id
    muteContent INTEGER NOT NULL DEFAULT 0,
    muteInteractions INTEGER NOT NULL DEFAULT 0,
    muteMessages INTEGER NOT NULL DEFAULT 0,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (sourceId, targetId) -- Ensure source/target do not have multiple of the same interactions
);