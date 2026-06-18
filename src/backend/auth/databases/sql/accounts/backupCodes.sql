CREATE TABLE IF NOT EXISTS backupCodes (
    userId TEXT NOT NULL,
    code TEXT PRIMARY KEY,
    isUsed INTEGER DEFAULT 0,
    usedDate TEXT,
    generatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);