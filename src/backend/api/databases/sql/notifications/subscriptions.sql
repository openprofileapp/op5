CREATE TABLE IF NOT EXISTS subscriptions (
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    isSubscribedToContent INTEGER NOT NULL DEFAULT 0,
    isSubscribedToCollaborationChanges INTEGER NOT NULL DEFAULT 0,
    isSubscribedToNewComments INTEGER NOT NULL DEFAULT 0,
    isSubscribedToNewInteractions INTEGER NOT NULL DEFAULT 0,
    isSubscribedToNewMessages INTEGER NOT NULL DEFAULT 0,

    UNIQUE (source, target)
);
