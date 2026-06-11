CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT,
    usernameOld TEXT,
    usernameOldExpire TEXT,
    displayName TEXT,
    fanflair TEXT,
    avatar TEXT,
    banner TEXT,
    status TEXT,
    about TEXT,
    tags TEXT,
    pronouns TEXT,
    birthdate TEXT,
    birthdateVisibility TEXT NOT NULL DEFAULT 'private',
    foundedDate TEXT,
    foundedDateVisibility TEXT NOT NULL DEFAULT 'public',
    theme TEXT DEFAULT '4819203746571029',
    isAuraEnabled INTEGER NOT NULL DEFAULT 0
        CHECK (isAuraEnabled IN (0, 1)),
    auraType TEXT NOT NULL DEFAULT 'flow'
        CHECK (auraType IN ('flow', 'pulse', 'stable')),
    auraPrimary TEXT, -- Hex, RGB, RGBA, HSL, HSLA, HSV, HWB, CMYK
    auraSecondary TEXT, -- Hex, RGB, RGBA, HSL, HSLA, HSV, HWB, CMYK
    type TEXT NOT NULL DEFAULT 'user'
        CHECK (type IN ('user', 'author', 'publisher', 'developer')),
    isExplicit INTEGER NOT NULL DEFAULT 0
        CHECK (isExplicit IN (0, 1)),
    visibility TEXT NOT NULL DEFAULT 'private',
    sendMessages TEXT NOT NULL DEFAULT 'public',
    sendComments TEXT NOT NULL DEFAULT 'public',
    presence TEXT NOT NULL DEFAULT 'offline',
    presenceVisibility TEXT NOT NULL DEFAULT 'public',
    lastActive TEXT,
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
