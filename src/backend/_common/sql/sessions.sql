CREATE TABLE IF NOT EXISTS sessions (
    userId TEXT,
    geoIpFirstFetch TEXT,
    geoIpLatestFetch TEXT,
    geoIpLatestFetchDate TEXT,
    userAgent TEXT,
    inviteCode TEXT,
    token TEXT UNIQUE,
    socketId TEXT UNIQUE,
    isTerminated INTEGER DEFAULT 0,
    totalDuration INTEGER DEFAULT 0,
    isConnected INTEGER DEFAULT 0,
    firstConnected TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    lastConnected TEXT
);