import { Database, Logger } from "kage-library";

import { config } from "../../../../app.config.js";

const log = new Logger({
    path: "/logs/api",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.api
});

const paths = {
    audits: "data/databases/audits.sqlite",
    metadata: "data/databases/metadata.sqlite",
    characters: "data/databases/characters.sqlite",
    users: "data/databases/users.sqlite",
    badges: "data/databases/badges.sqlite",
    awards: "data/databases/awards.sqlite",
    invites: "data/databases/invites.sqlite",
    collections: "data/databases/collections.sqlite",
    links: "data/databases/links.sqlite",
    pins: "data/databases/pins.sqlite",
    interactions: "data/databases/interactions.sqlite",
    media: "data/databases/media.sqlite",
    notifications: "data/databases/notifications.sqlite",
    advertisements: "data/databases/advertisements.sqlite",
    templates: "data/databases/templates.sqlite",
    blocks: "data/databases/blocks.sqlite"
}

export const db = {
    audits: new Database(paths.audits),
    metadata: new Database(paths.metadata),
    characters: new Database(paths.characters),
    users: new Database(paths.users),
    badges: new Database(paths.badges),
    awards: new Database(paths.awards),
    invites: new Database(paths.invites),
    collections: new Database(paths.collections),
    links: new Database(paths.links),
    pins: new Database(paths.pins),
    interactions: new Database(paths.interactions),
    media: new Database(paths.media),
    notifications: new Database(paths.notifications),
    advertisements: new Database(paths.advertisements),
    templates: new Database(paths.templates),
    blocks: new Database(paths.blocks)
};

db.audits.transaction(q => {
    if (!q("SELECT * FROM authentications LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/security/authentications.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM cors LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/security/cors.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM rateLimits LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/security/rateLimits.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/blocks.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM chats LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/chats.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM follows LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/follows.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM friends LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/friends.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM hides LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/hides.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM hiddenCollaborations LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/hiddenCollaborations.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM likes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/likes.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM reads LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/reads.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM restricts LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/restricts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM shares LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/shares.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM views LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/views.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM algorithm LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/audits/algorithm.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.characters.transaction(q => {
    if (!q("SELECT * FROM published LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/published.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM drafts LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/drafts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM published_categories LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/categories/published.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM draft_categories LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/categories/drafts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM published_blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/blocks/published.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM draft_blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/blocks/drafts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM published_rows LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/rows/published.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM draft_rows LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/rows/drafts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM published_fields LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/fields/published.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM draft_fields LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/fields/drafts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM published_values LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/values/published.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM draft_values LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/characters/values/drafts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.media.transaction(q => {
    if (!q("SELECT * FROM published LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/media/published.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM drafts LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/media/drafts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.users.transaction(q => {
    if (!q("SELECT * FROM users LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/users.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM permissions LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/permissions.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM interests LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/interests.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM usernames LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/usernames.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM webpush LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/users/webpush.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.badges.transaction(q => {
    if (!q("SELECT * FROM badges LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/badges.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.awards.transaction(q => {
    if (!q("SELECT * FROM awards LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/awards.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.invites.transaction(q => {
    if (!q("SELECT * FROM codes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/invites/codes.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM uses LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/invites/uses.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.collections.transaction(q => {
    if (!q("SELECT * FROM collections LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/collections/collections.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM items LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/collections/items.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.links.transaction(q => {
    if (!q("SELECT * FROM links LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/links.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.pins.transaction(q => {
    if (!q("SELECT * FROM pins LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/pins.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.interactions.transaction(q => {
    if (!q("SELECT * FROM blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/blocks.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
    
    if (!q("SELECT * FROM chats LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/chats.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM dismisses LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/dismisses.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM follows LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/follows.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM friends LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/friends.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM hides LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/hides.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM hiddenCollaborations LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/hiddenCollaborations.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM likes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/likes.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM reads LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/reads.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM restricts LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/restricts.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM shares LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/shares.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM views LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/interactions/views.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.notifications.transaction(q => {
    if (!q("SELECT * FROM inbox LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/notifications/inbox.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM subscriptions LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/notifications/subscriptions.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM mutes LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/notifications/mutes.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.advertisements.transaction(q => {
    if (!q("SELECT * FROM pool LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/advertisements/pool.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM views LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/advertisements/views.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM clicks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/advertisements/clicks.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.blocks.transaction(q => {
    if (!q("SELECT * FROM blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/blocks/blocks.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM rows LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/blocks/rows.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM fields LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/blocks/fields.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q(`SELECT * FROM "values" LIMIT 1`).success) { 
        const result = q(`${config.folders.sql.api}/blocks/values.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.templates.transaction(q => {
    if (!q(`SELECT * FROM templates LIMIT 1`).success) { 
        const result = q(`${config.folders.sql.api}/templates/templates.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM categories LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/templates/categories.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM blocks LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/templates/blocks.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM rows LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/templates/rows.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM fields LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/templates/fields.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q(`SELECT * FROM "values" LIMIT 1`).success) { 
        const result = q(`${config.folders.sql.api}/templates/values.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q(`SELECT * FROM history LIMIT 1`).success) { 
        const result = q(`${config.folders.sql.api}/templates/history.sql`);
        if (!result.success) log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM datasets LIMIT 1").success) { 
        const result = q(`${config.folders.sql.api}/templates/datasets.sql`);
        if (!result.success) log.db.error(result.error).save();
    };
});

db.characters.query(`ATTACH DATABASE '${paths.users}' AS users`);
db.characters.query(`ATTACH DATABASE '${paths.badges}' AS badges`);
db.characters.query(`ATTACH DATABASE '${paths.interactions}' AS interactions`);
db.characters.query(`ATTACH DATABASE '${paths.media}' AS media`);
db.characters.query(`ATTACH DATABASE '${paths.collections}' AS collections`);
db.characters.query(`ATTACH DATABASE '${paths.notifications}' AS notifications`);
db.characters.query(`ATTACH DATABASE '${paths.links}' AS links`);

db.users.query(`ATTACH DATABASE '${paths.badges}' AS badges`);
db.users.query(`ATTACH DATABASE '${paths.awards}' AS awards`);
db.users.query(`ATTACH DATABASE '${paths.interactions}' AS interactions`);
db.users.query(`ATTACH DATABASE '${paths.collections}' AS collections`);
db.users.query(`ATTACH DATABASE '${paths.notifications}' AS notifications`);
db.users.query(`ATTACH DATABASE '${paths.links}' AS links`);

db.collections.query(`ATTACH DATABASE '${paths.users}' AS users`);
db.collections.query(`ATTACH DATABASE '${paths.badges}' AS badges`);
db.collections.query(`ATTACH DATABASE '${paths.interactions}' AS interactions`);
db.collections.query(`ATTACH DATABASE '${paths.notifications}' AS notifications`);

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
            // Import preload files here
            import("./preload/templates/datasets.db.preload.js");
            import("./preload/templates/templates.db.preload.js");
            import("./preload/blocks/blocks.db.preload.js");
            import("./preload/blocks/rows.db.preload.js");
            import("./preload/blocks/fields.db.preload.js");
            import("./preload/blocks/values.db.preload.js");

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

            import("./migration/badges.db.migration.js");
            import("./migration/awards.db.migration.js");
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
            import("./migration/interactions/favorites.db.migration.js");

            import("./migration/notifications/inbox.db.migration.js");

        ;
        }

        setTimeout(check, 10);
    };

    check();
}

waitForMDB();
