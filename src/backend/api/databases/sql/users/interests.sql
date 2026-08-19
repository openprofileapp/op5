CREATE TABLE IF NOT EXISTS interests (
    userId TEXT NOT NULL,
    tag TEXT NOT NULL,
    algorithmScore INTEGER DEFAULT 0,

    UNIQUE (userId, tag)
);