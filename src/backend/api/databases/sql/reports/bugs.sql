CREATE TABLE IF NOT EXISTS bugs (
    id TEXT PRIMARY KEY NOT NULL,
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    errorId TEXT,
    description TEXT NOT NULL,
    reproductionSteps TEXT,
    expectedResults TEXT,
    actualResults TEXT,
    affectsStable INTEGER NOT NULL DEFAULT 0,
    affectsNightly INTEGER NOT NULL DEFAULT 0,
    userAgent TEXT NOT NULL DEFAULT 'unknown',
    status TEXT NOT NULL DEFAULT 'pending',
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (source, date)
);
