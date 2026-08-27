CREATE TABLE IF NOT EXISTS notifications (
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT,
    isRead INTEGER DEFAULT 0,
    readDate TEXT,
    sentDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (userId, type, data, sentDate)
);
