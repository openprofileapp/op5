CREATE TABLE IF NOT EXISTS emails (
    userId TEXT NOT NULL,
    email TEXT PRIMARY KEY NOT NULL,
    isPrimary INTEGER NOT NULL DEFAULT 0,
    isVerified INTEGER NOT NULL DEFAULT 0,
    isMfa INTEGER NOT NULL DEFAULT 0,
    isSubscribedToNewsletters INTEGER NOT NULL DEFAULT 1,
    isSubscribedToAccountNotifications INTEGER NOT NULL DEFAULT 1,
    isSubscribedToPromotionalMaterial INTEGER NOT NULL DEFAULT 1,
    addedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (userId, isPrimary)
);
