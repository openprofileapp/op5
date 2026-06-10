CREATE TABLE IF NOT EXISTS interests (
    user TEXT NOT NULL,
    interaction TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- interests should be score based