import { Database } from "kage-library";

import { config } from "../../../../app.config.js";
import { log } from "../instances.js";

const paths = {
    audits: "data/databases/audits.sqlite",
    metadata: "data/databases/metadata.sqlite",
    characters: "data/databases/characters.sqlite",
    users: "data/databases/users.sqlite",
    badges: "data/databases/badges.sqlite",
    invites: "data/databases/invites.sqlite",
    links: "data/databases/links.sqlite",
    pins: "data/databases/pins.sqlite",
    interactions: "data/databases/interactions.sqlite",
    media: "data/databases/media.sqlite"
}

export const db = {
    audits: new Database(paths.audits),
    metadata: new Database(paths.metadata),
    characters: new Database(paths.characters),
    users: new Database(paths.users),
    badges: new Database(paths.badges),
    invites: new Database(paths.invites),
    links: new Database(paths.links),
    pins: new Database(paths.pins),
    interactions: new Database(paths.interactions),
    media: new Database(paths.media)
};

db.characters.query(`ATTACH DATABASE '${paths.users}' AS users`);
db.characters.query(`ATTACH DATABASE '${paths.badges}' AS badges`);
db.characters.query(`ATTACH DATABASE '${paths.interactions}' AS interactions`);
db.characters.query(`ATTACH DATABASE '${paths.media}' AS media`);

db.users.query(`ATTACH DATABASE '${paths.badges}' AS badges`);
db.users.query(`ATTACH DATABASE '${paths.interactions}' AS interactions`);

db.audits.transaction(q => {
    if (!q("SELECT * FROM authentications LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/security/authentications.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM cors LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/security/cors.sql`);
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

    if (!q("SELECT * FROM chats LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/chats.sql`);
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

    if (!q("SELECT * FROM hides LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/hides.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM hiddenCollaborations LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/hiddenCollaborations.sql`);
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

    if (!q("SELECT * FROM reads LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/reads.sql`);
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

    if (!q("SELECT * FROM algorithm LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/algorithm.sql`);
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

    if (!q("SELECT * FROM drafts LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/drafts.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.media.transaction(q => {
    if (!q("SELECT * FROM published LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/media/published.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM drafts LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/media/drafts.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.users.transaction(q => {
    if (!q("SELECT * FROM users LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/users.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM permissions LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/permissions.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM interests LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/interests.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM usernames LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/usernames.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM webpush LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/webpush.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM notifications LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/notifications.sql`);
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

db.pins.transaction(q => {
    if (!q("SELECT * FROM pins LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/pins.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

db.interactions.transaction(q => {
    if (!q("SELECT * FROM blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/blocks.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
    
    if (!q("SELECT * FROM chats LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/chats.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM dismisses LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/dismisses.sql`);
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

    if (!q("SELECT * FROM hides LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/hides.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM hiddenCollaborations LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/hiddenCollaborations.sql`);
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
    profiles: new Database("data/databases/migration/profiles.db"),
    accounts: new Database("data/databases/migration/accounts.db"),
    partners: new Database("data/databases/migration/partners.db"),
    interactions: new Database("data/databases/migration/interactions.db")
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
            import("./migration/audits/hides.db.migration.js");
            import("./migration/audits/likes.db.migration.js");
            import("./migration/audits/views.db.migration.js");

            import("./migration/users/users.db.migration.js");
            import("./migration/users/interests.db.migration.js");
            import("./migration/users/usernames.db.migration.js");
            import("./migration/users/webpush.db.migration.js");
            import("./migration/users/notifications.db.migration.js");

            import("./migration/badges.db.migration.js");
            import("./migration/links.db.migration.js");
            import("./migration/characters/published.db.migration.js");
            import("./migration/characters/drafts.db.migration.js");
            import("./migration/media/published.db.migration.js");
            import("./migration/media/drafts.db.migration.js");
            import("./migration/invites/codes.db.migration.js");
            import("./migration/invites/uses.db.migration.js");

            import("./migration/interactions/follows.db.migration.js");
            import("./migration/interactions/friends.db.migration.js");
            import("./migration/interactions/hides.db.migration.js");
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
