CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY NOT NULL,
    source TEXT NOT NULL, -- User/asset/etc. id
    target TEXT, -- User/asset/etc. id  
    action TEXT NOT NULL, -- ACTION_NAME, 
    changes TEXT, -- JSON showing old and new { old: { ... }, new: { ... } }
    origin TEXT NOT NULL DEFAULT 'unknown',
    date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

    UNIQUE (source, action, date) -- Ensure audit do not have multiple of the same logs
);