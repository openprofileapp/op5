CREATE TABLE IF NOT EXISTS links (
    id TEXT NOT NULL, -- User or project id
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    previewText TEXT,
    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'followers', 'friends', 'unlisted', 'private', 'hidden')),
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (id, name) -- Ensure users/assets do not have multiple of the same links
);