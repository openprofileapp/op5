CREATE TABLE IF NOT EXISTS visits (
    userId TEXT NOT NULL DEFAULT 'guest',
    url TEXT NOT NULL,
    duration INTEGER NOT NULL,
    disconnected TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);