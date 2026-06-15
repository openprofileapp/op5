CREATE TABLE IF NOT EXISTS emails (
    userId TEXT NOT NULL,
    email TEXT PRIMARY KEY NOT NULL,
    isVerified INTEGER NOT NULL DEFAULT 0,
    isMfa INTEGER NOT NULL DEFAULT 0,
    isSubscribedToNewsletters INTEGER NOT NULL DEFAULT 1,
    isSubscribedToAccountNotifications INTEGER NOT NULL DEFAULT 1,
    isSubscribedToPromotionalMaterial INTEGER NOT NULL DEFAULT 1
);