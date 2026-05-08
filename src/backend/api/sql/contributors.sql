CREATE TABLE IF NOT EXISTS contributors (
    name TEXT,
    avatar TEXT,
    about TEXT,
    role TEXT,
    website TEXT,
    joinDate TEXT,
    leftDate TEXT
);

-- Default values
INSERT INTO contributors (name, avatar, about, role, website, joinDate, leftDate) VALUES

-- AvatarKage (Kage Library developer)
(
    'AvatarKage',
    'https://cdn.avatarka.ge/r/logo.png',
    NULL,
    'Contributor',
    'https://avatarkage.com?utm_campaign=github_templates',
    NULL,
    NULL
);