CREATE TABLE IF NOT EXISTS votes (
    userId TEXT NOT NULL,
    article TEXT NOT NULL,
    isHelpful INTEGER NOT NULL DEFAULT 0,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (userId, article)
);
