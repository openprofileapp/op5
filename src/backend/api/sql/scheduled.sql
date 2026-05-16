CREATE TABLE IF NOT EXISTS scheduled (
    id TEXT PRIMARY KEY NOT NULL,
    asset TEXT NOT NULL, -- Character, project, etc.
    user TEXT NOT NULL, -- User who scheduled
    message TEXT, -- The custom message displayed if isScheduleVisible is true
    -- ^ DEVELOPER NOTE: Maybe merge it with assets as like a banner or smth
    isScheduleVisible INTEGER NOT NULL DEFAULT 0
        CHECK (isScheduleVisible IN (0, 1)), -- If true, the overview will be readable before action date
    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'followers', 'friends', 'unlisted', 'private')),
    scheduledDate TEXT, -- The date the asset was scheduled by user
    actionDate TEXT -- The date the visibility update will trigger
);
