CREATE TABLE IF NOT EXISTS links (
    id TEXT NOT NULL, -- User or asset id
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    previewText TEXT,
    visibility TEXT NOT NULL DEFAULT 'public',
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (id, name) -- Ensure users/assets do not have multiple of the same links
);