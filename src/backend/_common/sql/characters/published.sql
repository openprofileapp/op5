CREATE TABLE IF NOT EXISTS published (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL, -- User or project
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
    isExplicit INTEGER NOT NULL DEFAULT 0
        CHECK (isExplicit IN (0, 1)),
    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'followers', 'friends', 'unlisted', 'private', 'hidden')),
    sendComments TEXT NOT NULL DEFAULT 'public'
        CHECK (sendComments IN ('public', 'followers', 'friends', 'private')),
    isScheduled INTEGER NOT NULL DEFAULT 0
        CHECK (isScheduled IN (0, 1)), -- The scheduled conditions are in scheduled.sql
    updatedDate TEXT,
    createdDate TEXT
);
