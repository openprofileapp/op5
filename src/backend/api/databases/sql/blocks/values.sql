CREATE TABLE IF NOT EXISTS "values" (
    blockId TEXT NOT NULL,
    fieldId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    UNIQUE (blockId, fieldId)
);
