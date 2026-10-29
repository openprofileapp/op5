CREATE TABLE IF NOT EXISTS payouts (
    paymentId TEXT NOT NULL,
    userId TEXT NOT NULL,
    total INTEGER DEFAULT 0,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
