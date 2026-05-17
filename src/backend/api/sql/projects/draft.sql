CREATE TABLE IF NOT EXISTS draft (
    id TEXT PRIMARY KEY NOT NULL,
    owner TEXT NOT NULL, -- User only
    slug TEXT,
    slugOld TEXT,
    slugOldExpire TEXT,
    displayName TEXT,
    avatar TEXT,
    banner TEXT,
    status TEXT,
    about TEXT,
    tags TEXT,
    created TEXT, -- Project creation date, not date added to OpenProfie
    createdVisibility TEXT NOT NULL DEFAULT 'public'
        CHECK (createdVisibility IN ('public', 'followers', 'private')),
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
        CHECK (visibility IN ('public', 'followers', 'unlisted', 'private')),
    sendComments TEXT NOT NULL DEFAULT 'public'
        CHECK (sendComments IN ('public', 'followers', 'private')),
    isScheduled INTEGER NOT NULL DEFAULT 0
        CHECK (isScheduled IN (0, 1)), -- The scheduled conditions are in scheduled.sql
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), -- Date added to OpenProfie
    isDeleted INTEGER NOT NULL DEFAULT 0
        CHECK (isDeleted IN (0, 1)),
    deletedDate TEXT
);
