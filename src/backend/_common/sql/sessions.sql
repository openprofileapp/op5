CREATE TABLE IF NOT EXISTS sessions (
    userId TEXT NOT NULL,
    geoFirstFetch TEXT,
    geoLastFetch TEXT,
    geoLastFetchDate TEXT,
    userAgent TEXT,
    inviteCode TEXT,
    token TEXT UNIQUE,
    socketId TEXT,
    isTerminated INTEGER DEFAULT 0,
    totalDuration INTEGER,
    isConnected INTEGER DEFAULT 0,
    firstConnected TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    lastConnected TEXT
);