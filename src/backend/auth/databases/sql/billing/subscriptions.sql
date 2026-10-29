CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    plan TEXT NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    endReason TEXT,
    dateCreated TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    dateStarted TEXT,
    dateEnded TEXT
);
