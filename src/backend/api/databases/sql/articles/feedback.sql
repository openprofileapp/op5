CREATE TABLE IF NOT EXISTS feedback (
    userId TEXT NOT NULL,
    article TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
