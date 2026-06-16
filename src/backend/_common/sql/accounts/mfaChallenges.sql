CREATE TABLE IF NOT EXISTS mfaChallenges (
    mfaToken TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT, -- E.g., 2FA_CODE, EXTERNAL_LOGIN
    attempts INTEGER DEFAULT 0,
    expireDate TEXT,
    completedDate TEXT,
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);