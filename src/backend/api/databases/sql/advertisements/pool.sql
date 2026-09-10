CREATE TABLE IF NOT EXISTS pool (
    id TEXT PRIMARY KEY NOT NULL,
    provierId TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    imageUrl TEXT NOT NULL,
    onClickUrl TEXT NOT NULL,
    clicksLeft INTEGER DEFAULT 0,
    isUnlimitedClicks INTEGER NOT NULL DEFAULT 0, 
    isActive INTEGER NOT NULL DEFAULT 0, 
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
