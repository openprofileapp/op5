CREATE TABLE IF NOT EXISTS payouts (
    transactionId TEXT,
    refPaymentId TEXT NOT NULL,
    userId TEXT NOT NULL,
    email TEXT NOT NULL,
    subtotal INTEGER DEFAULT 0,
    fee INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    senderBatchId TEXT,
    senderItemId TEXT,
    payoutBatchId TEXT,
    payoutItemId TEXT,
    dateCreated TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    dateProcessed TEXT
);
