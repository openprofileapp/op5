CREATE TABLE IF NOT EXISTS public (
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
    birthdate TEXT,
    birthdateVisibility TEXT NOT NULL DEFAULT 'private'
        CHECK (birthdateVisibility IN ('public', 'followers', 'friends', 'private')),
    founded TEXT,
    foundedVisibility TEXT NOT NULL DEFAULT 'public'
        CHECK (foundedVisibility IN ('public', 'followers', 'friends', 'private')),
    theme TEXT DEFAULT '4819203746571029',
    isAuraEnabled INTEGER NOT NULL DEFAULT 0
        CHECK (isAuraEnabled IN (0, 1)),
    auraType TEXT NOT NULL DEFAULT 'flow'
        CHECK (auraType IN ('flow', 'pulse', 'stable')),
    auraPrimary TEXT, -- Hex, RGB, RGBA, HSL, HSLA, HSV, HWB, CMYK
    auraSecondary TEXT, -- Hex, RGB, RGBA, HSL, HSLA, HSV, HWB, CMYK
    type TEXT NOT NULL DEFAULT 'user'
        CHECK (type IN ('user', 'author', 'publisher', 'developer')),
    explicit INTEGER NOT NULL DEFAULT 0
        CHECK (explicit IN (0, 1)),
    visibility TEXT NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('public', 'followers', 'friends', 'private')),
    recieveMessages TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'followers', 'friends', 'private')),
    lastActive TEXT,
    lastActiveVisibility TEXT NOT NULL DEFAULT 'public'
        CHECK (lastActiveVisibility IN ('public', 'followers', 'friends', 'private')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
