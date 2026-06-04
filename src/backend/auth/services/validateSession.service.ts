import type { Request, Response } from "express";
import net from "node:net";
import DeviceDetector from "node-device-detector";
import { DateTime } from "luxon"
import haversine from "haversine-distance"

import { AdvancedError, URL } from "kage-library";

import { config } from "../../../../app.config.js";
import { db, log, wc } from "../server.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import fetchGeoIp from "../helpers/fetchGeoIp.js";

function normalizeIp(ip?: string | string[]) {
    if (!ip) return undefined;
    const value = Array.isArray(ip) ? ip[0] : ip;
    return value.replace(/^::ffff:/, "");
}

export function validateIp(req: Request): string {
    const cfIP = normalizeIp(req.headers["cf-connecting-ip"] as string | string[] | undefined);
    const expressIP = normalizeIp(req.ip);

    if (cfIP && net.isIP(cfIP)) return cfIP;
    if (expressIP && net.isIP(expressIP)) return expressIP;

    return "";
}

export default async function validateSession(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const detector = new DeviceDetector();
    const url = new URL(`https://${config.domains.main}`);

    const userAgent = req.get("User-Agent") || req.get("user-agent") || "unknown"
    const inviteCode = req.query?.invite || req.cookies?.inviteCode;
    let clientSocketId = req.cookies?.socketId;
    const clientToken = req.cookies?.token;
    const validatedIp = validateIp(req);

    // If first visit, generate a socket id then save it
    if (!clientSocketId) {
        clientSocketId = crypto.randomUUID();
        const geoIpFetch = await fetchGeoIp(validatedIp);

        const result = db.sessions.query(
            `INSERT INTO sessions (geoIpFirstFetch, geoIpLatestFetch, socketId) VALUES (?, ?, ?)`,
            [JSON.stringify(geoIpFetch), JSON.stringify(geoIpFetch), clientSocketId]
        );

        if (!result.success) {
            log.db.error(result.error).save();
        }

        res.cookie("socketId", clientSocketId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });
    }

    // If invite is valid, save as cookie
    if (req.query?.invite && req.query?.invite !== req.cookies?.inviteCode) {

        const inviteData = await wc.callAPI(
            `https://${config.domains.api}/v2/invites?code=${req.query.invite}`
        );

        if ( // ADD A TYPE FOR THIS CALL BASED ON THE VERSION
            !inviteData?.isSuspended && inviteData?.isUnlimited ||
            !inviteData?.isSuspended && inviteData?.usesLeft > 0
        ) {
            res.cookie("inviteCode", req.query.invite, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${url.domain}`,
                path: "/",
            });
        }
    }

    // If session is invalid or suspicious, terminate it, delete cookies, then recall validation
    let sessionDatabaseResult;
    let geoIpLatestFetchOld;
    let geoIpLatestFetchNew;
    let suspicionScore = 0;

    if (clientToken) {
        sessionDatabaseResult = db.sessions.query(
            `SELECT * FROM sessions WHERE token = ? AND socketId = ?`,
            [clientToken, clientSocketId]
        );
    } else {
        sessionDatabaseResult = db.sessions.query(
            `SELECT * FROM sessions WHERE socketId = ?`,
            [clientSocketId]
        );
    }

    if (!sessionDatabaseResult.success) throw new AdvancedError({
        code: 500,
        message: "An error occurred while validating session",
    });

    if (
        sessionDatabaseResult.rowCount > 0 && 
        !sessionDatabaseResult.rows[0]?.isTerminated
    ) {
        // Handle security checks
        geoIpLatestFetchOld = JSON.parse(sessionDatabaseResult.rows[0]?.geoIpLatestFetch as string);
        geoIpLatestFetchNew = await fetchGeoIp(validatedIp);
        let distanceInMiles = 0;

        if (
            geoIpLatestFetchOld.latitude && 
            geoIpLatestFetchOld.longitude &&
            geoIpLatestFetchNew.latitude && 
            geoIpLatestFetchNew.longitude
        ) {
            distanceInMiles = haversine(
                { latitude: geoIpLatestFetchOld.latitude, longitude: geoIpLatestFetchOld.longitude },
                { latitude: geoIpLatestFetchNew.latitude, longitude: geoIpLatestFetchNew.longitude }
            ) / 1609.344;
        }

        // COMBINE THIS WITH OS AND BROWSER
        suspicionScore = distanceInMiles;
    }

    if (
        sessionDatabaseResult.rowCount === 0 ||
        sessionDatabaseResult.rows[0]?.isTerminated ||
        suspicionScore >= 100
    ) {
        res.clearCookie("socketId", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
        });

        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
        });

        if (suspicionScore >= 100) {
            // log.auth.warn(`Session for "${clientSocketId}" is terminated`).save();
            // Send a notification to the user and create a watchdog report
        } else {
            log.auth.warn(`Session for "${clientSocketId}" is terminated`).save();
        }

        // INSTEAD OF REFRESHING, RETURN A JSON ACTION TELLING THE CONTROLLER TO REFRESH
        return res.redirect(req.originalUrl || "/");
    }

















// SAVE VISIT IN THE AUDIT DATABASE


    // Proceed with validation
    const userAgentJSON = detector.detect(userAgent);
    const userAgentBotJSON = detector.parseBot?.(userAgent) || {};

    const isUserAgentBot =
        Object.keys(userAgentBotJSON || {}).length > 0 ||
        // Additional wildcards not caught by detector.parseBot
        /(axios|bot|crawl|spider|scraper|fetcher|monitor|validator|node)/i
        .test(userAgent);

    const formattedUserAgent = {
        string: userAgent,
        ...userAgentJSON,
        isBot: isUserAgentBot,
        ...(isUserAgentBot && {
            bot: userAgentBotJSON
        })
    };

    if (true) { // isUserAgentBot (if bot, can't login/access account)
        const role = PlatformPermissionsService.getRole("robot");
        const now = DateTime.now().toUTC().toISO();

        // REPLACE WITH UPDATE WHERE ID AND TOKEN IF TOKEN IS VALID
        const result = db.sessions.query(
            `UPDATE sessions SET
                geoIpLatestFetch = ?,
                geoIpLatestFetchDate = ?,
                userAgent = ?,
                inviteCode = ?,
                isConnected = ?,
                lastConnected = ?
            WHERE socketId = ?
            LIMIT 1`,
            [
                JSON.stringify(geoIpLatestFetchNew),
                now,
                JSON.stringify(formattedUserAgent),
                inviteCode,
                1,
                now,
                clientSocketId
            ]
        );

        if (!result.success) {
            log.db.error(result.error).save();
        }

        const crawlerMessages = [
            "says hi while passing through",
            "tried to be subtle, but left footprints",
            "is poking around the pages",
            "stopped by for a quick look",
            "wandered in without making much noise",
            "took a quick look around and paused briefly",
            "is here for a short visit",
            "dropped in to see what's going on",
            "made a brief appearance",
            "is checking things out casually",
            "is doing a light pass over the content",
            "came by, looked around, and lingered a bit"
        ];

        const msg = crawlerMessages[Math.floor(Math.random() * crawlerMessages.length)];

        log.auth.warn(`Crawler: "${formattedUserAgent.client.name}" ${msg}`).save();

        return {
            // geoIpFirstFetch: JSON.parse(sessionDatabaseResult.rows[0]?.geoIpFirstFetch as string),
            // geoIpLatestFetch: geoIpLatestFetchNew,
            // userAgent: formattedUserAgent,
            // inviteCode,
            // socketId: clientSocketId,
            permissions: {
                value: role.value,
                array: role.array
            }
        };
    } else {
        // login({ userId });

        // IF THE USER LOGS IN AT LEAST ONCE IN THE LAST 15 DAYS AND SESSION IS SOFT-TERMINATION (BEGINS DAY 20), 
        // REFRESH THE TOKEN INSTEAD OF EXPIRING IT IF WITHIN VALID SPACE COMPARED TO A HARD-TERMINATON

        // res.cookie("token", clientTokenNew, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "none",
        //     domain: `.${url.domain}`,
        //     path: "/",
        //     maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        // });

        // EXTERNALLY IF ACCOUNT DOESN'T EXIST, CALL REGISTER ACCOUNT ELSE LOGIN
        // login({ method: "google", id: externalId });
        // registerAccount(clientToken);

        // THEN return the rest of the login with the geo and perms and stuff
    }

    // If bot, return agent info with BOT PERMISSIONS ROLE
    // Else, call LOGIN(TOKEN) which returns the data and returns it to VALIDATESESSION();
}































































/*
CODE THIS SOMEWHERE HERE

LET SCORE (if >= 100, terminate)
Distance jump (50 miles) 10 score every 10 miles after
New device TYPE (not mobile/desktop) fingerprint / 80 score
New browser (new type) / 50 score

 If you border a state or city where your IP may give random surrounding locations, 
 it would log you out every new location (this is assuming the CURRENT LIVE system 
 was working and not bugged). Now, that system will not log you out unless there is 
 a certain radius difference. You could now travel with this new system as every 
 action on the site is refreshing your data keeping the cords distance within a 
 "safe" zone compared to say the token being sniped from across the country giving 
 a large "unsafe" distance that would trigger a termination ensuring your account 
 is safe.
 */



// when bot, log the bot name as temp page view    

// update totalDuration when leaving the site

    // log.network.info(req.headers).save();

/*

db.sessions.query(
    `INSERT INTO sessions (
        userId TEXT NOT NULL,
        geoIpFirstFetch TEXT,
        geoIpLatestFetch TEXT,
        geoIpLatestFetchDate TEXT,
        userAgent TEXT,
        inviteCode TEXT,
        token TEXT UNIQUE,
        socketId TEXT UNIQUE,
        isTerminated INTEGER DEFAULT 0,
        totalDuration INTEGER DEFAULT 0,
        isConnected INTEGER DEFAULT 0,
        firstConnected TEXT DEFAULT (strftime("%Y-%m-%dT%H:%M:%fZ","now")),
        lastConnected TEXT
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

// DISCONNECT SESSION USING WEBSOCKET


        // If no existing session, create a new one
        if (!session.id) {
            // Generate new identifiers
            session.id = identifier.generate("SESSION");
            session.account.public.ghost = generate_string("ghost");

            // Fetch geolocation
            session.geo.last = await geolocation(ip);

            // Save the session to database
            database.query("sessions", `INSERT INTO permanent (ghost, geo_first, geo_last, geo_date, agent, theme, id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [session.account.public.ghost, session.geo.last, session.geo.last, timestamp.generate("0s", "datetime"), session.agent, metadata.theme, session.id]
            );
        }

        // Validate the session
        if (session.id && session.token) {
            // Check for existing sessions via id and token, then update the last IP authentication (when applicable)
            row = database.query("sessions", `SELECT ghost, user, geo_first, geo_last, geo_date, agent, theme, invite, socket, terminated, connected, duration, connected_first, connected_last FROM permanent WHERE id = ? AND token = ?`, [session.id, session.token]);
            if (!row) {return res.status(401).send("");} // Restart authentication

            // Periodically refresh user location (every 15 minutes), or if a suspicious access is detected
            const refresh = timestamp.generate(row.geo_date, "add", "15m");
            const countdown = timestamp.generate(refresh, "countdown");

            if (countdown.total_ms <= 0 || 
                normalize(session.agent.os.name) !== normalize(row.agent.os.name) ||
                normalize(session.agent.os.version) !== normalize(row.agent.os.version) ||
                normalize(session.agent.os.platform) !== normalize(row.agent.os.platform) ||
                normalize(session.agent.os.family) !== normalize(row.agent.os.family) ||
                normalize(session.agent.client.name) !== normalize(row.agent.client.name) ||
                normalize(session.agent.client.family) !== normalize(row.agent.client.family)
            ) {session.geo.last = await geolocation(ip); // Fetch geolocation

                // If location or agent changed significantly, terminate the session
                let terminate = 0;
                if (normalize(session.geo.last.country) !== normalize(row.geo_last.country) || 
                    normalize(session.geo.last.region) !== normalize(row.geo_last.region) ||
                    normalize(session.agent.os.family) !== normalize(row.agent.os.family) ||
                    normalize(session.agent.client.family) !== normalize(row.agent.client.family)
                ){terminate = 1}

                database.query("sessions", `UPDATE permanent SET geo_last = ?, geo_date = ?, terminated = ? WHERE id = ?`, [session.geo.last, timestamp.generate("0s", "datetime"), terminate, session.id]);
                if (terminate) {
                    session.owner = row.user; session.id = null; session.token = null; session.account = null; // Reformat JSON 
                    await notification(null, clean(session), "LOGIN") // Send security notification
                    return res.status(401).send(""); // Restart authentication
                }
            }

            session.geo.first = row.geo_first; row.geo_first = null; // Reformat JSON
            session.geo.last = row.geo_last; row.geo_last = null; // Reformat JSON
            session.invite.code = row.invite; row.invite = null; // Reformat JSON
            session.account.public.ghost = row.ghost; row.ghost = null; // Reformat JSON
            session.account.public.id = row.user; row.user = null; // Reformat JSON
            session.account.public.theme = row.theme; row.theme = null; // Reformat JSON
            Object.assign(session, clean(row));
        } else if (session.id) {
            // Check for existing sessions via id, then update the last IP authentication (when applicable)
            row = database.query("sessions", `SELECT ghost, geo_first, geo_last, geo_date, agent, theme, invite, socket, terminated, connected, duration, connected_first, connected_last FROM permanent WHERE id = ?`, [session.id]);
            if (!row) {return res.status(401).send("");} // Restart authentication

            // Periodically refresh user location (every 15 minutes), or if a suspicious access is detected
            const refresh = timestamp.generate(row.geo_date, "add", "15m");
            const countdown = timestamp.generate(refresh, "countdown");

            if (countdown.total_ms <= 0 || 
                normalize(session.agent.os.name) !== normalize(row.agent.os.name) ||
                normalize(session.agent.os.version) !== normalize(row.agent.os.version) ||
                normalize(session.agent.os.platform) !== normalize(row.agent.os.platform) ||
                normalize(session.agent.os.family) !== normalize(row.agent.os.family) ||
                normalize(session.agent.client.name) !== normalize(row.agent.client.name) ||
                normalize(session.agent.client.family) !== normalize(row.agent.client.family)
            ) {session.geo.last = await geolocation(ip); // Fetch geolocation

                // If location or agent changed significantly, terminate the session
                let terminate = 0;
                if (normalize(session.geo.last.country) !== normalize(row.geo_last.country) || 
                    normalize(session.geo.last.region) !== normalize(row.geo_last.region) ||
                    normalize(session.agent.os.family) !== normalize(row.agent.os.family) ||
                    normalize(session.agent.client.family) !== normalize(row.agent.client.family)
                ){terminate = 1}

                database.query("sessions", `UPDATE permanent SET geo_last = ?, geo_date = ?, terminated = ? WHERE id = ?`, [session.geo.last, timestamp.generate("0s", "datetime"), terminate, session.id]);
                if (terminate) {
                    return res.status(401).send(""); // Restart authentication
                }
            }

            session.geo.first = row.geo_first; row.geo_first = null; // Reformat JSON
            session.geo.last = row.geo_last; row.geo_last = null; // Reformat JSON
            session.invite.code = row.invite; row.invite = null; // Reformat JSON
            session.account.public.ghost = row.ghost; row.ghost = null; // Reformat JSON
            session.account.public.theme = row.theme; row.theme = null; // Reformat JSON
            Object.assign(session, clean(row));
        }

        // Limit authentication if under maintenance
        if (maintenance.enabled) {
            return res.json(clean(session));
        }

        // If an invite code is present, validate it then save to database
        let account
        if (session.invite?.code) {
            const precursor = database.query("accounts", `SELECT * FROM invites WHERE code = ?`, [session.invite.code]);
            const partner = database.query("partners", `SELECT * FROM codes WHERE code = ?`, [session.invite.code]);
            account = database.query("accounts", `SELECT id, username, display_name FROM public WHERE id = ?`, [precursor?.user || partner?.user]);
            if (account) {session.invite.account = account.display_name || account.username || account.id || "Hidden User"};
            if (precursor) {session.invite.type = "precursor"} else if (partner) {session.invite.type = "partner"}
        } else if (!session.invite.code && invite) {
            const precursor = database.query("accounts", `SELECT * FROM invites WHERE code = ? AND used = 0`, [invite]);
            const partner = database.query("partners", `SELECT * FROM codes WHERE code = ?`, [invite]);
            if (precursor || partner) { session.invite.code = invite; database.query("sessions", `UPDATE permanent SET invite = ? WHERE id = ?`, [invite, session.id]);}
            if (precursor) {account = database.query("accounts", `SELECT user FROM invites WHERE code = ?`, [invite]);}
            account = database.query("accounts", `SELECT id, username, display_name FROM public WHERE id = ?`, [precursor?.user || partner?.user]);
            if (account) {session.invite.account = account.display_name || account.username || account.id || "Hidden User"};
            if (precursor) {session.invite.type = "precursor"} else if (partner) {session.invite.type = "partner"}
        }

        // If session id and token are valid, load account data
        if (session.account.public.id) {
            session.account.private = database.query("accounts", `SELECT birthdate, permissions, locale, timezone, revenue, suspended FROM private WHERE id = ?`, [session.account.public.id]);
            session.account.private.permissions = { value: session.account.private.permissions, array: permissions.decode(session.account.private.permissions)}
            session.account.private.emails = database.query("accounts", `SELECT email, confirmed, mfa_enabled, newsletter_updates, newsletter_notifications, newsletter_promotional FROM emails WHERE user = ?`, [session.account.public.id]);
            session.account.private.phone_numbers = database.query("accounts", `SELECT phone_number, confirmed, mfa_enabled, newsletter_updates, newsletter_notifications, newsletter_promotional FROM phone_numbers WHERE user = ?`, [session.account.public.id]);
            session.account.private.subscriptions = database.query("accounts", `SELECT id, plan, method, date_start, date_end FROM subscriptions WHERE user = ?`, [session.account.public.id]);
            session.account.private.notifications = database.query("accounts", "SELECT COUNT(*) AS length FROM notifications WHERE id = ? and read = 0", [session.account.public.id])?.length || 0;
            session.account.public = database.query("accounts", `SELECT * FROM public WHERE id = ?`, [session.account.public.id]);
            session.account.public.badges = database.query("accounts", `SELECT * FROM badges WHERE user = ?`, [session.account.public.id]);
            session.account.public.pseudonyms = database.query("accounts", `SELECT pseudonym, visibility, date FROM pseudonyms WHERE user = ?`, [session.account.public.id]);
            session.account.public.connections = database.query("accounts", `SELECT name, id, verified, visibility, mfa_enabled, date FROM connections WHERE user = ?`, [session.account.public.id]);
            session.account.public.interests = database.query("accounts", `SELECT topic, score FROM interests WHERE user = ?`, [session.account.public.id]);
            if (permissions.check(session.account.private.permissions.value, ["PARTNER"])) {
                session.account.public.partner = database.query("partners", `SELECT code FROM codes WHERE user = ?`, [session.account.public.id]);
            }
        }

        // Limit cocurrent users to prevent loading errors; staff and partners can bypass
        if (!permissions.check(session.account.private.permissions.value, ["WARN_USERS"]) || !permissions.check(session.account.private.permissions.value, ["PARTNER"])) {
            // If the user is already active, reset their timeout, else add them to the active map
            const key = session?.account?.public?.id || session.geo.last.ip || session.id
            if (guard.online.has(key)) {
                clearTimeout(guard.online.get(key));
                guard.online.set(key, setTimeout(() => guard.online.delete(key), guard.timeout));
            } else {
                guard.online.set(key, setTimeout(() => guard.online.delete(key), guard.timeout)); 
            }
        }

        return res.json(clean(session));
    
});


// UPDATE THE API SERVICES TO INCLUDE CODE STATUS AND TYPES AND LOGS

    

    
// OLD CODE
    const makeRequest = (cookie = "") =>
        api(
            "post",
            "application/json",
            `${routes.auth}/v2/session${invite ? `?invite=${invite}` : ""}`,
            { id, token },
            application_secret,
            {
                cookie,
                "user-agent": req.headers["user-agent"] || "",
                ip: validate_ip(req)
            }
        );

    const MAX_RETRIES = 3;
    let attempt = 0;
    let response = null;

    try {
        while (attempt < MAX_RETRIES) {
            attempt++;
            try {
                response = await makeRequest(req.headers.cookie || "");

                if (response.status === 401) {
                    const cookie_options = {
                        expires: new Date(0),
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        domain: `.${domains.release}`
                    };

                    res.cookie("id", "", cookie_options);
                    res.cookie("token", "", cookie_options);

                    response = await makeRequest("");
                }

                if (response.status === 503) {
                    return res.status(503).send("Server busy, try again later");
                }

                if (!response.ok) {
                    throw new Error(`Auth server error: ${response.status}`);
                }

                break;
            } catch (err) {
                console.warn(`[AUTH ATTEMPT ${attempt}] failed: ${err.message || err}`);
                if (attempt === MAX_RETRIES) throw err;
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        req.session = await response.json();

        if (!req.cookies?.id && req.session?.id) {
            res.cookie("id", req.session.id, {
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${domains.release}`
            });
        }

        if (invite) {
            res.cookie("invite", invite, {
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${domains.release}`
            });
        }

        next();
    } catch (err) {
        console.error("[RENDER AUTH ERROR - ALL RETRIES FAILED]", err);
        return res.status(500).send("Failed to authenticate after maximum attempts. Please refresh the page.");
    }
};








export const iController = async (req: Request, res: Response) => {
    let clientId = req.cookies.clientId;

    const url = new URL(`https://${config.domains.main}`);

    if (!clientId) {
        clientId = crypto.randomUUID();

        res.cookie("clientId", clientId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
        });
    }

    res.sendStatus(200);
};


*/