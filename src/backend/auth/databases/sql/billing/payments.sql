CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    subscriptionId TEXT NOT NULL,
    userId TEXT NOT NULL,
    subtotal INTEGER DEFAULT 0,
    tax INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
