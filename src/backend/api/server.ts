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

/* 
————————————————————————————————————————————————————————————————
Connect databases
———————————————————————————————————————————————————————————————— 
*/

export const db = {
    metadata: new Database("data/databases/metadata.sqlite"),
    characters: new Database("data/databases/characters.sqlite"),
    users: new Database("data/databases/users.sqlite"),
    badges: new Database("data/databases/badges.sqlite"),
    invites: new Database("data/databases/invites.sqlite")
};

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

/* 
————————————————————————————————————————————————————————————————
Migrade databases from v5.0.237 to v5.0.300
———————————————————————————————————————————————————————————————— 
*/

export const mdb = {
    profiles: new Database("data/databases/v5.0.237/profiles.db"),
    accounts: new Database("data/databases/v5.0.237/accounts.db"),
    partners: new Database("data/databases/v5.0.237/partners.db")
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
        q(
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
                lastActiveVisibility,
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
    }
});

// accounts.db/badges -> badges.sqlite/badges
const mdbAccountsBadgesData = mdb.accounts.query("SELECT * from badges");

db.badges.transaction(q => {
    if (!mdbAccountsBadgesData.success) return;

    for (const d of mdbAccountsBadgesData.rows) {
        if (d.type === "admin" || d.type === "moderator") {
            d.type = "staff";
        }

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
                d.visibility,
                d.date // UPDATE ALL DATES TO USE ISO ON ALL DB MIGRATIONS
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