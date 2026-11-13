CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY NOT NULL,
    accountId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    action TEXT NOT NULL,
    accountVisibility TEXT,
    assetVisibility TEXT,
    type TEXT NOT NULL,
    moderatorNote TEXT,
    moderatorId TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0, 
    revokedPermissions TEXT NOT NULL DEFAULT '0',
    revokedPermissionsDuration INTEGER NOT NULL DEFAULT 0, 
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    revokedById TEXT,
    revokedReason TEXT,
    revokedDate TEXT
);
