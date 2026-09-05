CREATE TABLE IF NOT EXISTS published (
    algorithmScore INTEGER NOT NULL DEFAULT 0,
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL, -- User or project
    slug TEXT,
    displayName TEXT,
    avatar TEXT,
    animatedAvatar TEXT,
    banner TEXT,
    about TEXT,
    tags TEXT DEFAULT '[]',
    license TEXT,
    licenseId TEXT,
    isAuraEnabled INTEGER NOT NULL DEFAULT 0,
    auraType TEXT NOT NULL DEFAULT 'flow',
    auraPrimary TEXT,
    auraSecondary TEXT,
    isSensitive INTEGER NOT NULL DEFAULT 0,
    isMature INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'public',
    readVisibility TEXT NOT NULL DEFAULT 'default',
    sendComments TEXT NOT NULL DEFAULT 'default',
    isScheduled INTEGER NOT NULL DEFAULT 0, -- The scheduled conditions are in scheduled.sql
    updatedDate TEXT,
    createdDate TEXT
);
