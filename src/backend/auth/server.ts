import https from "https";
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { config } from "../../../app.config.js";
import { log } from "./instances.js";
import { db } from "./databases/db.js";
import getEnv from "../../_common/helpers/getEnv.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from "../_common/middlewares/cors.middleware.js";
import { maintenanceMiddleware } from "../_common/middlewares/maintenance.middleware.js";
import sessionRoute from "./routes/session.route.js";
import loginRoutes from "./routes/login.routes.js";
import captchaRoute from "./routes/captcha.route.js";
import tokenRoute from "./routes/token.route.js";
import mfaRoutes from "./routes/mfa.routes.js";
import { validateSessionMiddleware } from "./middlewares/validateSession.middleware.js";
import rateLimitMiddleware from "../_common/middlewares/rateLimit.middleware.js";

/* 
————————————————————————————————————————————————————————————————
Create server 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("trust proxy", 1);
app.set("json spaces", 2);
const router = Router();

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

router.use("/captcha", validateSessionMiddleware, rateLimitMiddleware(60), captchaRoute);
router.use("/token", validateSessionMiddleware, rateLimitMiddleware(120), tokenRoute);
router.use("/session", validateSessionMiddleware, rateLimitMiddleware(240), sessionRoute);
router.use("/login", validateSessionMiddleware, rateLimitMiddleware(10), loginRoutes);
router.use("/mfa", validateSessionMiddleware, rateLimitMiddleware(20), mfaRoutes);






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
// CRON TO UNPREMIUM BADGE AND PERMS WHEN USER IS NO LONGER SUBSCRIBED (IF DATE EXISTS, ELSE SKIP)
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