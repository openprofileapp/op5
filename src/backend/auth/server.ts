import https from "https";
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import path from "path";
import maxmind, { CityResponse } from "maxmind";

import { 
    Database,
    Identifier,
    Logger,
    Snowflake,
    WebClient,
} from "kage-library";

import { config } from "../../../app.config.js";
import getEnv from "../../_common/helpers/getEnv.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from "../_common/middlewares/cors.middleware.js";
import { maintenanceMiddleware } from "../_common/middlewares/maintenance.middleware.js";
import sessionRoute from "./routes/session.route.js";
import loginRoutes from "./routes/login.routes.js";
import PlatformPermissionsService from "../_common/services/platformPermissions.service.js";
import captchaRoute from "./routes/captcha.route.js";
import tokenRoute from "./routes/token.route.js";

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("json spaces", 2);
const router = Router();

export const log = new Logger({
    path: "/logs/auth",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.api
});

export const snowflake = new Snowflake(config.generation.epoch, 0);
export const wc = new WebClient({
    crawler: config.crawler,
    useSecureSSL: config.isProduction
});

export const id = new Identifier({
    HASH: { regex: /[a-f0-9]/, length: 32 },
    TOKEN: { regex: /[A-Za-z0-9]/, length: 64 }
});

export const geoip2 = await maxmind.open<CityResponse>(
    path.resolve("data/databases/static/geoip2/cities.mmdb")
);

/* 
————————————————————————————————————————————————————————————————
Connect databases
———————————————————————————————————————————————————————————————— 
*/

export const db = {
    accounts: new Database("data/databases/accounts.sqlite"),
};

db.accounts.transaction(q => {
    if (!q("SELECT * FROM sessions LIMIT 1").success) { q(`${config.folders.sql}/accounts/sessions.sql`); };
    if (!q("SELECT * FROM users LIMIT 1").success) { q(`${config.folders.sql}/accounts/users.sql`); };
    if (!q("SELECT * FROM bots LIMIT 1").success) { q(`${config.folders.sql}/accounts/bots.sql`); };
    if (!q("SELECT * FROM connections LIMIT 1").success) { q(`${config.folders.sql}/accounts/connections.sql`); };
    if (!q("SELECT * FROM emails LIMIT 1").success) { q(`${config.folders.sql}/accounts/emails.sql`); };
});

/* 
————————————————————————————————————————————————————————————————
Migrade databases from v5.0.237 to v5.0.300
———————————————————————————————————————————————————————————————— 
*/

export const mdb = {
    accounts: new Database("data/databases/v5.0.237/accounts.db")
};

// accounts.db/users -> accounts.sqlite/users
const mdbAccountsUsersData = mdb.accounts.query("SELECT * from private");

db.accounts.transaction(q => {
    if (!mdbAccountsUsersData.success) return;

    for (const d of mdbAccountsUsersData.rows) {
        q(
            `INSERT INTO users (
                id,
                hasEmail,
                permissions,
                locale,
                timezone,
                isSuspended,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.email,
                PlatformPermissionsService.getRole("member").value,
                d.locale,
                d.timezone,
                d.suspended,
                d.created_date // UPDATE ALL DATES TO USE ISO ON ALL DB MIGRATIONS
            ]
        );
    }
});

// accounts.db/bots -> accounts.sqlite/bots
const mdbAccountsBotsData = mdb.accounts.query("SELECT * from bots");

db.accounts.transaction(q => {
    if (!mdbAccountsBotsData.success) return;

    for (const d of mdbAccountsBotsData.rows) {
        q(
            `INSERT INTO bots (
                id,
                token,
                ownerId,
                displayName,
                about,
                permissions,
                lastActive,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.token,
                d.owner,
                d.name,
                d.about,
                d.permissions,
                d.last_active,
                d.created_date
            ]
        );
    }
});

// accounts.db/connections -> accounts.sqlite/connections
const mdbAccountsConnectionsData = mdb.accounts.query("SELECT * from connections");

db.accounts.transaction(q => {
    if (!mdbAccountsConnectionsData.success) return;

    for (const d of mdbAccountsConnectionsData.rows) {
        if (!d.verified) continue;

        q(
            `INSERT INTO connections (
                userId,
                connectionId,
                connectionName,
                isMfa,
                connectedDate
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                d.user,
                d.id,
                d.name,
                d.mfa_enabled,
                d.date
            ]
        );
    }
});

// accounts.db/emails -> accounts.sqlite/emails
const mdbAccountsEmailsData = mdb.accounts.query("SELECT * from emails");

db.accounts.transaction(q => {
    if (!mdbAccountsEmailsData.success) return;

    for (const d of mdbAccountsEmailsData.rows) {
        q(
            `INSERT INTO emails (
                userId,
                email,
                isConfirmed,
                isMfa,
                isSubscribedToNewsletters,
                isSubscribedToAccountNotifications,
                isSubscribedToPromotionalMaterial
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                d.user,
                d.email,
                d.confirmed,
                d.mfa_enabled,
                d.newsletter_updates,
                d.newsletter_notifications,
                d.newsletter_promotional
            ]
        );
    }
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

app.use("/", router);

router.use("/captcha", captchaRoute);
router.use("/token", tokenRoute);
router.use("/session", sessionRoute);
router.use("/login", loginRoutes);

// login = creates the session 
//
// login() -> create session and stuff then calls validate()
// validate() -> checks if valid else calls login()
//
// validate/session = quickly checks if the cookie is valid 

// OLD CODE
/*server.auth.post("/v2/session", watchdog, rate_limit(240), async (req, res) => {
    const invite = req.query?.invite || req.cookies?.invite;
    const { id, token } = req.body; // If bot login attempt
    // try { } catch (error) {
        forward_status("error", "server", "authenticate", error.code, error.message);
        return res.status(500).send(error.message);
    }*/

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL"), app);
const port = config.ports.auth

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










/* 
// CRON TO DELETE EXPIRED OR TERMINATED SESSIONS
const result = db.accounts.query(
    `DELETE FROM sessions WHERE sessionId = ? LIMIT 1`,
    [sessionId]
);

if (!result.success) {
    throw new AdvancedError({
        code: 500,
        message: "An error occurred while deleting session",
        details: result.error
    })
}
*/

// PORT ACCOUNTS/USERS AND SESSION MANAGEMENT

// Session management only applies to auth, all servers check-in with /session

// https://auth.openprofile.app/session (kill active-session on country or state change)
// https://auth.openprofile.app/login (both users and bots)

// Add login with Microsoft, BlueSky, X, Facebook

// auth manages the following db: sessions, users private
// validateSession();