CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    hasEmail INTEGER NOT NULL DEFAULT 0
        CHECK (hasEmail IN (0, 1)),
    hasPhoneNumber INTEGER NOT NULL DEFAULT 0
        CHECK (hasPhoneNumber IN (0, 1)),
    password TEXT,
    birthdate TEXT,
    mfaSecret TEXT,
    permissions TEXT NOT NULL,
    locale TEXT DEFAULT 'en-us',
    timezone TEXT DEFAULT 'America/New_York',
    earnedRevenue INTEGER DEFAULT 0,
    hasReadTerms INTEGER NOT NULL DEFAULT 0
        CHECK (hasReadTerms IN (0, 1)),
    isSuspended INTEGER NOT NULL DEFAULT 0
        CHECK (isSuspended IN (0, 1)),
    isDeleted INTEGER NOT NULL DEFAULT 0
        CHECK (isDeleted IN (0, 1)),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
