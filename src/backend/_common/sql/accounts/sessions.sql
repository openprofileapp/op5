CREATE TABLE IF NOT EXISTS sessions (
    userId TEXT,
    geoIpFirstFetch TEXT,
    geoIpLatestFetch TEXT,
    geoIpLatestFetchDate TEXT,
    userAgent TEXT,
    inviteCode TEXT,
    sessionId TEXT PRIMARY KEY,
    accessToken TEXT UNIQUE,
    sessionToken TEXT UNIQUE,
    accessTokenExpireDate TEXT,
    sessionTokenExpireDate TEXT,
    isTerminated INTEGER DEFAULT 0,
    totalDuration INTEGER DEFAULT 0,
    isConnected INTEGER DEFAULT 0,
    firstConnectedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    lastConnectedDate TEXT
);