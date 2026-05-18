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
import sessionRoute from './routes/session.route.js';

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set('json spaces', 2);
const router = Router();

export const log = new Logger({
    path: "/logs/auth",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.api
});

export const snowflake = new Snowflake(config.generation.epoch);
export const wc = new WebClient({
    crawler: config.crawler,
    useSecureSSL: config.isProduction
});

/* 
————————————————————————————————————————————————————————————————
Connect databases
———————————————————————————————————————————————————————————————— 
*/

export const db = {
    sessions: new Database("data/databases/sessions.sqlite"),
    accounts: new Database("data/databases/accounts.sqlite"),
};

db.sessions.transaction(q => {
    if (!q("SELECT * FROM sessions LIMIT 1").success) { q(`${config.folders.sql}/sessions.sql`); };
});

db.accounts.transaction(q => {
    if (!q("SELECT * FROM bots LIMIT 1").success) { q(`${config.folders.sql}/accounts/bots.sql`); };
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

app.use('/', router);

router.use('/session', sessionRoute);

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





// PORT ACCOUNTS/USERS AND SESSION MANAGEMENT

// Session management only applies to auth, all servers check-in with /session

// https://auth.openprofile.app/session (kill active-session on country or state change)
// https://auth.openprofile.app/login (both users and bots)

// Add login with Microsoft, BlueSky, X, Facebook

// auth manages the following db: sessions, users private
// validateSession();