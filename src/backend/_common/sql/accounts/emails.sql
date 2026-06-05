CREATE TABLE IF NOT EXISTS emails (
    userId TEXT NOT NULL,
    email TEXT PRIMARY KEY NOT NULL,
    isConfirmed INTEGER NOT NULL DEFAULT 0
        CHECK (isConfirmed IN (0, 1)),
    isMfa INTEGER NOT NULL DEFAULT 0
        CHECK (isMfa IN (0, 1)),
    isSubscribedToNewsletters INTEGER NOT NULL DEFAULT 1
        CHECK (isSubscribedToNewsletters IN (0, 1)),
    isSubscribedToAccountNotifications INTEGER NOT NULL DEFAULT 1
        CHECK (isSubscribedToAccountNotifications IN (0, 1)),
    isSubscribedToPromotionalMaterial INTEGER NOT NULL DEFAULT 1
        CHECK (isSubscribedToPromotionalMaterial IN (0, 1))
);