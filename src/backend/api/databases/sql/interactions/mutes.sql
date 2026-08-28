CREATE TABLE IF NOT EXISTS mutes (
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    muteContent INTEGER NOT NULL DEFAULT 0,
    muteInteractions INTEGER NOT NULL DEFAULT 0,
    muteMessages INTEGER NOT NULL DEFAULT 0,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (source, target)
);
