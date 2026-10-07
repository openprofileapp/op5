CREATE TABLE IF NOT EXISTS views (
    userId TEXT NOT NULL,
    article TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (userId, article, date)
);
