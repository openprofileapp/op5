CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    hasEmail INTEGER NOT NULL DEFAULT 0,
    hasPhoneNumber INTEGER NOT NULL DEFAULT 0,
    password TEXT,
    birthdate TEXT,
    isMfaEnabled INTEGER DEFAULT 0,
    totpSecret TEXT,
    permissions TEXT NOT NULL,
    locale TEXT DEFAULT 'en-us',
    timezone TEXT DEFAULT 'America/New_York',
    earnedRevenueUSD INTEGER DEFAULT 0,
    hasReadTerms INTEGER NOT NULL DEFAULT 0,
    hasCompletedOnboarding INTEGER NOT NULL DEFAULT 0,
    isSuspended INTEGER NOT NULL DEFAULT 0,
    isDeleted INTEGER NOT NULL DEFAULT 0,
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
