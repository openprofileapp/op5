CREATE TABLE IF NOT EXISTS reserved (
    username TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE,
    phoneNumber TEXT UNIQUE
    isVerified INTEGER NOT NULL DEFAULT 0,
    isPartner INTEGER NOT NULL DEFAULT 0,
    isLifetimePremium INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    reservedBy TEXT,
    dateReserved TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);