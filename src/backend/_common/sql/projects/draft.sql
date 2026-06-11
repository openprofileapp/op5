CREATE TABLE IF NOT EXISTS draft (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL, -- User only
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
    createdVisibility TEXT NOT NULL DEFAULT 'public',
    license TEXT,
    licenseContact TEXT,
    isAuraEnabled INTEGER NOT NULL DEFAULT 0,
    auraType TEXT NOT NULL DEFAULT 'flow',
    auraPrimary TEXT, -- Hex, RGB, RGBA, HSL, HSLA, HSV, HWB, CMYK
    auraSecondary TEXT, -- Hex, RGB, RGBA, HSL, HSLA, HSV, HWB, CMYK
    isExplicit INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'public',
    sendComments TEXT NOT NULL DEFAULT 'public',
    isScheduled INTEGER NOT NULL DEFAULT 0, -- The scheduled conditions are in scheduled.sql
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), -- Date added to OpenProfie
    isDeleted INTEGER NOT NULL DEFAULT 0,
    deletedDate TEXT
);
