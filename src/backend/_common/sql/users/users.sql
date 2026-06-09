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
    birthdate TEXT,
    birthdateVisibility TEXT NOT NULL DEFAULT 'private'
        CHECK (birthdateVisibility IN ('public', 'followers', 'friends', 'private')),
    foundedDate TEXT,
    foundedDateVisibility TEXT NOT NULL DEFAULT 'public'
        CHECK (foundedDateVisibility IN ('public', 'followers', 'friends', 'private')),
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
    visibility TEXT NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('public', 'followers', 'friends', 'private', 'hidden')),
    sendMessages TEXT NOT NULL DEFAULT 'public'
        CHECK (sendMessages IN ('public', 'followers', 'friends', 'private')),
    sendComments TEXT NOT NULL DEFAULT 'public'
        CHECK (sendComments IN ('public', 'followers', 'friends', 'private')),
    presence TEXT NOT NULL DEFAULT 'offline'
        CHECK (presence IN ('online', 'idle', 'dnd', 'offline')),
    presenceVisibility TEXT NOT NULL DEFAULT 'public'
        CHECK (presenceVisibility IN ('public', 'followers', 'friends', 'private')),
    lastActive TEXT,
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
