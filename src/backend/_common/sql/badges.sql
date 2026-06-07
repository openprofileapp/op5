CREATE TABLE IF NOT EXISTS badges (
    id TEXT NOT NULL, -- User or project id
    type TEXT NOT NULL,
    comment TEXT, -- The reason or milestone that earned the badge
    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'followers', 'friends', 'private', 'hidden')),
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (id, type) -- Ensure users/assets do not have multiple of the same badges
);
