import { Database } from "kage-library";

import { config } from "../../../../app.config.js";
import { log } from "../instances.js";

export const db = {
    audits: new Database("data/databases/audits.sqlite"),
    metadata: new Database("data/databases/metadata.sqlite"),
    characters: new Database("data/databases/characters.sqlite"),
    users: new Database("data/databases/users.sqlite"),
    badges: new Database("data/databases/badges.sqlite"),
    invites: new Database("data/databases/invites.sqlite"),
    links: new Database("data/databases/links.sqlite"),
    interactions: new Database("data/databases/interactions.sqlite")
};

db.audits.transaction(q => {
    if (!q("SELECT * FROM authentications LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/security/authentications.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM rateLimits LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/security/rateLimits.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/blocks.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM follows LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/follows.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM friends LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/friends.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM likes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/likes.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM mutes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/mutes.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM restricts LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/restricts.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM shares LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/shares.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM views LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/views.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.metadata.transaction(q => {
    if (!q("SELECT * FROM metadata LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/metadata.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.characters.transaction(q => {
    if (!q("SELECT * FROM published LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/published.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.users.transaction(q => {
    if (!q("SELECT * FROM users LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/users.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM pins LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/pins.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.badges.transaction(q => {
    if (!q("SELECT * FROM badges LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/badges.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.invites.transaction(q => {
    if (!q("SELECT * FROM codes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/invites/codes.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM uses LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/invites/uses.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.links.transaction(q => {
    if (!q("SELECT * FROM links LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/links.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.interactions.transaction(q => {
    if (!q("SELECT * FROM blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/blocks.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM follows LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/follows.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM friends LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/friends.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM likes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/likes.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM mutes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/mutes.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM reads LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/reads.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM restricts LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/restricts.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM shares LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/shares.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM views LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/views.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

// Migration (old databases)
export const mdb = {
    profiles: new Database("data/databases/v5.0.237/profiles.db"),
    accounts: new Database("data/databases/v5.0.237/accounts.db"),
    partners: new Database("data/databases/v5.0.237/partners.db"),
    interactions: new Database("data/databases/v5.0.237/interactions.db")
};

async function waitForMDB() {
    const check = () => {
        if (
            mdb?.profiles &&
            mdb?.accounts &&
            mdb?.partners &&
            mdb?.interactions
        ) {
            // Import migration files here
            import("./migration/audits/follows.db.migration.js");
            import("./migration/audits/friends.db.migration.js");
            import("./migration/audits/likes.db.migration.js");
            import("./migration/audits/views.db.migration.js");

            import("./migration/users/users.db.migration.js");
            import("./migration/badges.db.migration.js");
            import("./migration/links.db.migration.js");
            import("./migration/characters/published.db.migration.js");
            import("./migration/invites/codes.db.migration.js");
            import("./migration/invites/uses.db.migration.js");

            import("./migration/interactions/follows.db.migration.js");
            import("./migration/interactions/friends.db.migration.js");
            import("./migration/interactions/likes.db.migration.js");
            import("./migration/interactions/reads.db.migration.js");
            import("./migration/interactions/views.db.migration.js");

            return;
        }

        setTimeout(check, 10);
    };

    check();
}

waitForMDB();