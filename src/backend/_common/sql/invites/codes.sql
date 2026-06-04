CREATE TABLE IF NOT EXISTS codes (
    ownerId TEXT NOT NULL,
    code TEXT PRIMARY KEY,
    usesLeft INTEGER DEFAULT 0,
    isUnlimited INTEGER NOT NULL DEFAULT 0
        CHECK (isUnlimited IN (0, 1)), 
    isSuspended INTEGER NOT NULL DEFAULT 0
        CHECK (isSuspended IN (0, 1)), 
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
