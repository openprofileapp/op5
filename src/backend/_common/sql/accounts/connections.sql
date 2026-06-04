CREATE TABLE IF NOT EXISTS connections (
    user TEXT NOT NULL,
    name TEXT NOT NULL,
    text TEXT,
    id TEXT NOT NULL, -- Connection ID can be a website URL for custom links
    verified INTEGER DEFAULT 0,
    visibility TEXT DEFAULT 'public',
    mfa_enabled INTEGER DEFAULT 0,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IF VERIFIED; MOVE TO PRVATE ACCUNTS/CONNECTIONS
-- IF NOT VERIFIED; MOVE TO PUBLIC USERS/LINKS

-- CHECK .OLD FOR DATA