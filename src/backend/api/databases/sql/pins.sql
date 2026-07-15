CREATE TABLE IF NOT EXISTS pins (
    ownerId TEXT NOT NULL, -- User or assets id
    assetId TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (ownerId, assetId) -- Ensure users/assets do not have multiple of the same pins
);