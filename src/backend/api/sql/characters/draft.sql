CREATE TABLE IF NOT EXISTS draft (
    id TEXT PRIMARY KEY NOT NULL,
    owner TEXT NOT NULL, -- User or project
    slug TEXT,
    displayName TEXT,
    avatar TEXT,
    animatedAvatar TEXT,
    banner TEXT,
    about TEXT,
    tags TEXT,
    license TEXT,
    licenseContact TEXT,
    isAuraEnabled INTEGER NOT NULL DEFAULT 0
        CHECK (isAuraEnabled IN (0, 1)),
    auraType TEXT NOT NULL DEFAULT 'flow'
        CHECK (auraType IN ('flow', 'pulse', 'stable')),
    auraPrimary TEXT, -- Hex, RGB, RGBA, HSL, HSLA, HSV, HWB, CMYK
    auraSecondary TEXT, -- Hex, RGB, RGBA, HSL, HSLA, HSV, HWB, CMYK
    explicit INTEGER NOT NULL DEFAULT 0
        CHECK (explicit IN (0, 1)),
    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'followers', 'friends', 'unlisted', 'private')),
    sendComments TEXT NOT NULL DEFAULT 'public'
        CHECK (sendComments IN ('public', 'followers', 'friends', 'private')),
    isScheduled INTEGER NOT NULL DEFAULT 0
        CHECK (isScheduled IN (0, 1)), -- The scheduled conditions are in scheduled.sql
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    isDeleted INTEGER NOT NULL DEFAULT 0
        CHECK (isDeleted IN (0, 1)),
    deletedDate TEXT
);
