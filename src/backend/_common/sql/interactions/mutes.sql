CREATE TABLE IF NOT EXISTS mutes (
    sourceId TEXT NOT NULL, -- User id
    targetId TEXT NOT NULL, -- User or asset id
    muteContent INTEGER NOT NULL DEFAULT 0
        CHECK (muteContent IN (0, 1)),
    muteInteractions INTEGER NOT NULL DEFAULT 0
        CHECK (muteInteractions IN (0, 1)),
    muteMessages INTEGER NOT NULL DEFAULT 0
        CHECK (muteMessages IN (0, 1)),
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);