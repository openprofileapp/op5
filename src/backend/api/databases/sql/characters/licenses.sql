CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    previousversionId TEXT,
    abbreviation TEXT,
    displayName TEXT,
    text TEXT, -- Where the license text goes if an external url isn't used
    externalUrl TEXT,
    copyrightYear TEXT,
    contactEmail TEXT,
    contactPhoneNumber TEXT,
    contactAddress TEXT,
    allowFanart INTEGER NOT NULL DEFAULT 0, 
    -- If true, allows fans to draw and share fanart, including the use of official images as reference
    allowFanfiction INTEGER NOT NULL DEFAULT 0, 
    -- If true, allows fans to write and share fanfiction, including the use of official images as reference
    allowCosplays INTEGER NOT NULL DEFAULT 0, 
    -- If true, allows fans to cosplay and share photos/videos, including the use of official images as reference
    allowMonetizedFanWorks INTEGER NOT NULL DEFAULT 0, 
    -- If true, allows fans to earn ad-based revenue and/or crowdfund their fan works
    allowCommissionFanWorks INTEGER NOT NULL DEFAULT 0, 
    -- If true, allows fans to get paid for commissioned fan works
    allowCommercialUseFanWorks INTEGER NOT NULL DEFAULT 0, 
    -- If true, allows fans to sell fan works for profit (e.g., prints, merch)
    dosAndDonts INTEGER NOT NULL DEFAULT 0, -- Permission value for what is and what is not allowed
    isAttributionRequired INTEGER NOT NULL DEFAULT 1, 
    -- If true, require fan works to properly credit the IP and/or creator
    attributionInstructions TEXT,
    attributionFormat TEXT, -- An editable copy and paste text
    activeFromDate TEXT,
    updatedDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    createdDate TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- allowBlockchainUse, allowAiUse, allowAiFanWorks is force disabled


-- DOS AND DONTS BUT USE A NEW PERMISSIONS SYSTEM FOR THIS
allowControversialContextUse INTEGER NOT NULL DEFAULT 0, 
-- If true, allows fan works to use the character in real-world political and religious settings
allowCharacterAlterations INTEGER NOT NULL DEFAULT 0, 
-- If true, allows fan works to modify or reinterpret the character in a recognizable manner (age, genderswap, time era, clothing etc.)
-- DEV NOTE: Likely add a checkbox system to filter each DOs and DONTs. Alternatively, let fans read the license text and decide for themselves.
allowShipping INTEGER NOT NULL DEFAULT 0, 
-- If true, allows fan works to form unofficial romantic pairs
allowMatureFanWorks INTEGER NOT NULL DEFAULT 0, 
-- If true, allows fans to create mature (18+) fan works