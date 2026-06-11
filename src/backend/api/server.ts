import https from 'https';
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { 
    Database,
    Logger,
    Snowflake,
    WebClient,
} from "kage-library";

import { config } from '../../../app.config.js';
import getEnv from '../../_common/helpers/getEnv.js';
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from '../_common/middlewares/cors.middleware.js';
import { maintenanceMiddleware } from '../_common/middlewares/maintenance.middleware.js';
import userRoute from './routes/user.route.js';
import profileRoute from './routes/profile.route.js';
import inviteRoute from './routes/invite.route.js';
import interactionRoutes from './routes/interaction.routes.js';

/* 
————————————————————————————————————————————————————————————————
Connect databases
———————————————————————————————————————————————————————————————— 
*/

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
    if (!q("SELECT * FROM blocks LIMIT 1").success) { q(`${config.folders.sql}/audits/blocks.sql`); };
    if (!q("SELECT * FROM follows LIMIT 1").success) { q(`${config.folders.sql}/audits/follows.sql`); };
    if (!q("SELECT * FROM friends LIMIT 1").success) { q(`${config.folders.sql}/audits/friends.sql`); };
    if (!q("SELECT * FROM likes LIMIT 1").success) { q(`${config.folders.sql}/audits/likes.sql`); };
    if (!q("SELECT * FROM mutes LIMIT 1").success) { q(`${config.folders.sql}/audits/mutes.sql`); };
    if (!q("SELECT * FROM restricts LIMIT 1").success) { q(`${config.folders.sql}/audits/restricts.sql`); };
    if (!q("SELECT * FROM shares LIMIT 1").success) { q(`${config.folders.sql}/audits/shares.sql`); };
    if (!q("SELECT * FROM views LIMIT 1").success) { q(`${config.folders.sql}/audits/views.sql`); };
});

db.metadata.transaction(q => {
    if (!q("SELECT * FROM metadata LIMIT 1").success) { q(`${config.folders.sql}/metadata.sql`); };
});

db.characters.transaction(q => {
    if (!q("SELECT * FROM published LIMIT 1").success) { q(`${config.folders.sql}/characters/published.sql`); };
});

db.users.transaction(q => {
    if (!q("SELECT * FROM users LIMIT 1").success) { q(`${config.folders.sql}/users/users.sql`); };
});

db.badges.transaction(q => {
    if (!q("SELECT * FROM badges LIMIT 1").success) { q(`${config.folders.sql}/badges.sql`); };
});

db.invites.transaction(q => {
    if (!q("SELECT * FROM codes LIMIT 1").success) { q(`${config.folders.sql}/invites/codes.sql`); };
    if (!q("SELECT * FROM uses LIMIT 1").success) { q(`${config.folders.sql}/invites/uses.sql`); };
});

db.links.transaction(q => {
    if (!q("SELECT * FROM links LIMIT 1").success) { q(`${config.folders.sql}/links.sql`); };
});

db.interactions.transaction(q => {
    if (!q("SELECT * FROM blocks LIMIT 1").success) { q(`${config.folders.sql}/interactions/blocks.sql`); };
    if (!q("SELECT * FROM follows LIMIT 1").success) { q(`${config.folders.sql}/interactions/follows.sql`); };
    if (!q("SELECT * FROM friends LIMIT 1").success) { q(`${config.folders.sql}/interactions/friends.sql`); };
    if (!q("SELECT * FROM likes LIMIT 1").success) { q(`${config.folders.sql}/interactions/likes.sql`); };
    if (!q("SELECT * FROM mutes LIMIT 1").success) { q(`${config.folders.sql}/interactions/mutes.sql`); };
    if (!q("SELECT * FROM reads LIMIT 1").success) { q(`${config.folders.sql}/interactions/reads.sql`); };
    if (!q("SELECT * FROM restricts LIMIT 1").success) { q(`${config.folders.sql}/interactions/restricts.sql`); };
    if (!q("SELECT * FROM shares LIMIT 1").success) { q(`${config.folders.sql}/interactions/shares.sql`); };
    if (!q("SELECT * FROM views LIMIT 1").success) { q(`${config.folders.sql}/interactions/views.sql`); };
});

/* 
————————————————————————————————————————————————————————————————
Migrade databases from v5.0.237 to v5.0.300
———————————————————————————————————————————————————————————————— 
*/

export const tempSnowflake = new Snowflake(config.generation.epoch, 1);

export const mdb = {
    profiles: new Database("data/databases/v5.0.237/profiles.db"),
    accounts: new Database("data/databases/v5.0.237/accounts.db"),
    partners: new Database("data/databases/v5.0.237/partners.db"),
    interactions: new Database("data/databases/v5.0.237/interactions.db")
};

// profiles.db/published -> characters.sqlite/published
const mdbProfilesPublishedData = mdb.profiles.query("SELECT * from published");

db.characters.transaction(q => {
    if (!mdbProfilesPublishedData.success) return;

    for (const d of mdbProfilesPublishedData.rows) {
        q(
            `INSERT INTO published (
                id, 
                ownerId, 
                slug,
                displayName,
                avatar,
                banner,
                about,
                tags,
                license,
                licenseContact,
                isAuraEnabled,
                auraType,
                auraPrimary,
                auraSecondary,
                isExplicit,
                visibility,
                isScheduled,
                updatedDate,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.owner,
                d.url,
                d.display_name,
                d.avatar,
                d.banner,
                d.about,
                d.tags,
                d.license,
                d.license_contact,
                d.aura || 0,
                "flow",
                d.aura_primary,
                d.aura_secondary,
                d.explicit,
                d.visibility || "public",
                0,
                d.updated_date,
                d.created_date
            ]
        );
    }
});

// accounts.db/public -> accounts.sqlite/public
const mdbAccountsPublicData = mdb.accounts.query("SELECT * from public");

db.users.transaction(q => {
    if (!mdbAccountsPublicData.success) return;

    for (const d of mdbAccountsPublicData.rows) {
        const r = q(
            `INSERT INTO users (
                id,
                username,
                usernameOld,
                usernameOldExpire,
                displayName,
                fanflair,
                avatar,
                banner,
                status,
                about,
                tags,
                birthdate,
                birthdateVisibility,
                foundedDate,
                foundedDateVisibility,
                theme,
                isAuraEnabled,
                auraType,
                auraPrimary,
                auraSecondary,
                type,
                isExplicit,
                visibility,
                sendMessages,
                lastActive,
                presenceVisibility,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.username,
                d.username_old ,
                d.username_old_expire ,
                d.display_name,
                d.fanflair,
                d.avatar,
                d.banner,
                d.status,
                d.about,
                d.tags,
                d.birthdate,
                d.birthdate_visibility,
                d.founded,
                d.founded_visibility,
                d.theme,
                d.aura || 0,
                "flow",
                d.aura_primary,
                d.aura_secondary,
                d.type,
                d.explicit || 0,
                d.visibility || "public",
                d.messages,
                d.last_active,
                d.last_active_visibility,
                d.created_date
            ]
        );

        console.log(r)
    }
});

const mdbAccountsBadgesData = mdb.accounts.query("SELECT * from badges");

db.badges.transaction(q => {
    if (!mdbAccountsBadgesData.success) return;

    let presursorCount = 0;

    const rows = [...mdbAccountsBadgesData.rows].sort(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    rows.push({
        user: "8057185762390040",
        type: "staff",
        text: "Social Media Manager",
        date: "2026-05-08T01:53:00Z"
    });

    for (const d of rows) {
        if (d.type === "admin" || d.type === "moderator") {
            d.type = "staff";
        }

        if (d.type === "precursor") {
            presursorCount++;

            d.text = `Registration #${presursorCount}`;
        }

        if (d.user === "0000000000000000" && d.type === "staff") continue;

        q(
            `INSERT INTO badges (
                id,
                type,
                comment,
                visibility,
                date
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                d.user,
                d.type,
                d.text,
                d.visibility || "public",
                d.date
            ]
        );
    }
});

// partners.db/codes -> invites.sqlite/codes
const mdbPartnersCodeData = mdb.partners.query("SELECT * from codes");

db.invites.transaction(q => {
    if (!mdbPartnersCodeData.success) return;

    for (const d of mdbPartnersCodeData.rows) {
        q(
            `INSERT INTO codes (
                ownerId,
                code,
                isUnlimited,
                createdDate
            ) VALUES (?, ?, ?, ?)`,
            [
                d.user,
                d.code,
                1,
                d.date
            ]
        );
    }
});

// partners.db/uses -> invites.sqlite/uses
const mdbPartnersUsesData = mdb.partners.query("SELECT * from uses");

db.invites.transaction(q => {
    if (!mdbPartnersUsesData.success) return;

    for (const d of mdbPartnersUsesData.rows) {
        q(
            `INSERT INTO uses (
                userId,
                code,
                date
            ) VALUES (?, ?, ?)`,
            [
                d.user,
                d.code,
                d.date
            ]
        );
    }
});

// accounts.db/connections -> users.sqlite/links
const mdbAccountsConnectionsData = mdb.accounts.query("SELECT * from connections");

db.links.transaction(q => {
    if (!mdbAccountsConnectionsData.success) return;

    for (const d of mdbAccountsConnectionsData.rows) {
        if (d.verified) continue;

        q(
            `INSERT INTO links (
                id,
                url,
                name,
                previewText,
                visibility,
                date
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                d.user,
                d.id,
                d.name,
                d.text,
                d.visibility || "public",
                d.date
            ]
        );
    }
});

// interactions.db/follows -> interactions.sqlite/follows & audits.sqlite/follows 
const mdbInteractionsFollowsData = mdb.interactions.query("SELECT * from follows");

db.interactions.transaction(q => {
    if (!mdbInteractionsFollowsData.success) return;

    for (const d of mdbInteractionsFollowsData.rows) {
        q(
            `INSERT INTO follows (
                sourceId,
                targetId,
                date
            ) VALUES (?, ?, ?)`,
            [
                d.user,
                d.interaction,
                d.date
            ]
        );
    }
});

db.audits.transaction(q => {
    if (!mdbInteractionsFollowsData.success) return;

    for (const d of mdbInteractionsFollowsData.rows) {
        q(
            `INSERT INTO follows (
                logId,
                sourceId,
                targetId,
                action,
                date
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                tempSnowflake.gen(),
                d.user,
                d.interaction,
                "FOLLOW",
                d.date
            ]
        );
    }
});

// interactions.db/friends -> interactions.sqlite/friends & audits.sqlite/friends 
const mdbInteractionsFriendsData = mdb.interactions.query("SELECT * from friends");

db.interactions.transaction(q => {
    if (!mdbInteractionsFriendsData.success) return;

    for (const d of mdbInteractionsFriendsData.rows) {
        q(
            `INSERT INTO friends (
                sourceId,
                targetId,
                date
            ) VALUES (?, ?, ?)`,
            [
                d.user,
                d.interaction,
                d.date
            ]
        );
    }
});

db.audits.transaction(q => {
    if (!mdbInteractionsFriendsData.success) return;

    for (const d of mdbInteractionsFriendsData.rows) {
        q(
            `INSERT INTO friends (
                logId,
                sourceId,
                targetId,
                action,
                date
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                tempSnowflake.gen(),
                d.user,
                d.interaction,
                "ACCEPT",
                d.date
            ]
        );
    }
});

// interactions.db/likes -> interactions.sqlite/likes & audits.sqlite/likes 
const mdbInteractionsLikesData = mdb.interactions.query("SELECT * from likes");

db.interactions.transaction(q => {
    if (!mdbInteractionsLikesData.success) return;

    for (const d of mdbInteractionsLikesData.rows) {
        q(
            `INSERT INTO likes (
                sourceId,
                targetId,
                date
            ) VALUES (?, ?, ?)`,
            [
                d.user,
                d.interaction,
                d.date
            ]
        );
    }
});

db.audits.transaction(q => {
    if (!mdbInteractionsLikesData.success) return;

    for (const d of mdbInteractionsLikesData.rows) {
        q(
            `INSERT INTO likes (
                logId,
                sourceId,
                targetId,
                action,
                date
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                tempSnowflake.gen(),
                d.user,
                d.interaction,
                "LIKE",
                d.date
            ]
        );
    }
});

// interactions.db/reads -> interactions.sqlite/reads & audits.sqlite/views 
const mdbInteractionsReadsData = mdb.interactions.query("SELECT * from reads");

db.interactions.transaction(q => {
    if (!mdbInteractionsReadsData.success) return;

    for (const d of mdbInteractionsReadsData.rows) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (d.user && d.user.includes(".")) d.user = "unknown";

        q(
            `INSERT INTO reads (
                sourceId,
                targetId,
                date
            ) VALUES (?, ?, ?)`,
            [
                d.user,
                d.interaction,
                d.date
            ]
        );
    }
});

db.audits.transaction(q => {
    if (!mdbInteractionsReadsData.success) return;

    for (const d of mdbInteractionsReadsData.rows) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (d.user && d.user.includes(".")) d.user = "unknown";

        q(
            `INSERT INTO views (
                logId,
                sourceId,
                targetId,
                action,
                disconnectedDate
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                tempSnowflake.gen(),
                d.user,
                d.interaction,
                "READ",
                d.date
            ]
        );
    }
});

// interactions.db/views -> interactions.sqlite/views & audits.sqlite/views 
const mdbInteractionsViewsData = mdb.interactions.query("SELECT * from views");

db.interactions.transaction(q => {
    if (!mdbInteractionsViewsData.success) return;

    for (const d of mdbInteractionsViewsData.rows) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (d.user && d.user.includes(".")) d.user = "unknown";

        q(
            `INSERT INTO views (
                sourceId,
                targetId,
                date
            ) VALUES (?, ?, ?)`,
            [
                d.user,
                d.interaction,
                d.date
            ]
        );
    }
});

db.audits.transaction(q => {
    if (!mdbInteractionsViewsData.success) return;

    for (const d of mdbInteractionsViewsData.rows) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (d.user && d.user.includes(".")) d.user = "unknown";

        q(
            `INSERT INTO views (
                logId,
                sourceId,
                targetIdOrUrl,
                action,
                disconnectedDate
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                tempSnowflake.gen(),
                d.user,
                d.interaction,
                "VIEW",
                d.date
            ]
        );
    }
});

// NOTE MOVE ALL FAVS INTO A FAV COLLECTION "My Favorites"

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set('json spaces', 2);
const v2 = Router();

export const log = new Logger({
    path: "/logs/api",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.api
});

export const snowflake = new Snowflake(config.generation.epoch, 1);
export const wc = new WebClient({
    crawler: config.crawler,
    database: db.metadata,
    useSecureSSL: config.isProduction
});

/* 
————————————————————————————————————————————————————————————————
Middlewares
———————————————————————————————————————————————————————————————— 
*/

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.use(maintenanceMiddleware);

/* 
————————————————————————————————————————————————————————————————
Routes
———————————————————————————————————————————————————————————————— 
*/

app.use('/v2', v2);

v2.use('/users', userRoute);
v2.use('/profiles', profileRoute);
v2.use('/invites', inviteRoute);
v2.use('/interactions', interactionRoutes);

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL"), app);
const port = config.ports.api

server.listen(port, "0.0.0.0", () => {
    log.server.info(`Server online at https://localhost:${port}`);
});

process.once("SIGTERM", () => terminateApp(log, db));
process.once("SIGINT", () => terminateApp(log, db));

/* 
————————————————————————————————————————————————————————————————
Scheduled events
———————————————————————————————————————————————————————————————— 
*/

// Run everyday at midnight
cron.schedule("0 0 * * *", () => {
    log.cron.info("Running daily tasks...");
    log.cleanLogs();
});