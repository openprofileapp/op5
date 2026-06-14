CREATE TABLE IF NOT EXISTS sessions (
    userId TEXT,
    geoIpFirstFetch TEXT,
    geoIpLatestFetch TEXT,
    geoIpLatestFetchExpireDate TEXT,
    userAgent TEXT,
    inviteCode TEXT,
    sessionId TEXT PRIMARY KEY,
    accessToken TEXT UNIQUE,
    accessTokenExpireDate TEXT,
    sessionToken TEXT UNIQUE,
    sessionTokenExpireDate TEXT,
    isTerminated INTEGER DEFAULT 0,
    totalDuration INTEGER DEFAULT 0,
    isConnected INTEGER DEFAULT 0,
    firstConnectedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    lastConnectedDate TEXT
);