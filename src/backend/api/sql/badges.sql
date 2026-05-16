CREATE TABLE IF NOT EXISTS badges (
    id TEXT NOT NULL, -- User or project id
    type TEXT NOT NULL
        CHECK (type IN ('official', 'staff', 'verified', 'contributor', 'entomologist', 'precursor', 'premium', 'promoted')),
    comment TEXT, -- The reason or milestone that earned the badge
    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'followers', 'friends', 'private')),
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (id, type) -- Ensure users do not have multiple of the same badges
);
