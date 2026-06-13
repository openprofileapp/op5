import type { CookieOptions, Request, Response } from "express";
import net from "node:net";
import DeviceDetector from "node-device-detector";
import { DateTime } from "luxon";
import haversine from "haversine-distance"
import crypto from "crypto";

import { AdvancedError, URL } from "kage-library";

import { config } from "../../../../app.config.js";
import { db, id, log, wc } from "../server.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import fetchGeoIp from "../helpers/fetchGeoIp.js";
import { InviteType } from "../../_common/types/queries/invite.type.js";
import { UserAgentType } from "../../_common/types/queries/userAgent.type.js";
import { SessionType } from "../../_common/types/queries/session.type.js";

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
    let sessionId = req.cookies?.sessionId;
    let accessToken = req.cookies?.accessToken;
    let sessionToken = req.cookies?.sessionToken;

    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: `.${url.domain}`,
        path: "/",
    }

    const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));
    const now = DateTime.now().toUTC().toISO();

    // If first visit, generate a device token then save it
    if (!sessionId) {
        sessionId = id.gen("HASH");

        accessToken = id.gen("TOKEN");

        const hashedAccessToken = crypto.createHash("sha256").update(accessToken).digest("hex");

        const result = db.accounts.query(
            `INSERT INTO sessions (
                geoIpFirstFetch, 
                geoIpLatestFetch, 
                sessionId,
                accessToken,
                firstConnectedDate, 
                lastConnectedDate
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                JSON.stringify(newGeoIpLatestFetch), 
                JSON.stringify(newGeoIpLatestFetch), 
                sessionId,
                hashedAccessToken,
                now, 
                now
            ]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while saving session",
                details: result.error
            })
        }

        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 5, // 5 minutes
        });
    } else {
        // Refesh the cookie so it doesn't expire
        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });
    }

    const result = db.accounts.query<SessionType>(
        `SELECT * FROM sessions WHERE sessionId = ? LIMIT 1`,
        [sessionId]
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching session",
            details: result.error
        })
    }

    // If invalid session, clear cookies and restart
    if (result.rowCount < 1) {
        res.clearCookie("sessionId", cookieOptions);
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("sessionToken", cookieOptions);

        return { action: "REFRESH_PAGE" };
    }

    const row = result.rows[0];

    const isSessionVoid =
        row.isTerminated ||
        row.sessionTokenExpireDate && new Date(row.sessionTokenExpireDate as string) < new Date();

    if (isSessionVoid) {
        res.clearCookie("sessionId", cookieOptions);
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("sessionToken", cookieOptions);

        return { action: "REFRESH_PAGE" };
    };

    const userAgentJSON = detector.detect(userAgent);
    const userAgentBotJSON = detector.parseBot?.(userAgent) || {};

    const isUserAgentBot =
        Object.keys(userAgentBotJSON || {}).length > 0 ||
        // Additional wildcards not caught by detector.parseBot
        /(axios|bot|crawl|spider|scraper|fetcher|monitor|validator|node)/i
        .test(userAgent);

    const formattedUserAgent: UserAgentType = {
        string: userAgent,
        ...userAgentJSON,
        isBot: isUserAgentBot,
        ...(isUserAgentBot && {
            bot: userAgentBotJSON
        })
    };

    // If bot, return session here
    if (isUserAgentBot) {
        // FILE A WATCH DOG REPORT

        const role = PlatformPermissionsService.getRole("robot");

        // Update the session row
        const updatedBotSessionResult = db.accounts.query(
            `UPDATE sessions SET
                geoIpLatestFetch = ?,
                geoIpLatestFetchDate = ?,
                userAgent = ?,
                isConnected = ?,
                lastConnectedDate = ?
            WHERE sessionId = ?
            LIMIT 1`,
            [
                JSON.stringify(newGeoIpLatestFetch),
                now,
                JSON.stringify(formattedUserAgent),
                1,
                now,
                sessionId
            ]
        );

        if (!updatedBotSessionResult.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while updating session",
                details: updatedBotSessionResult.error
            })
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
            userId: row.userId,
            permissions: {
                value: role.value,
                array: role.array
            }
        };
    }

    // If session is suspicious, delete session, clear cookies, and restart
    let suspicionScore = 0;
    let distanceInMiles = 0;

    if (
        row.geoIpLatestFetch.latitude && 
        row.geoIpLatestFetch.longitude &&
        newGeoIpLatestFetch.latitude && 
        newGeoIpLatestFetch.longitude
    ) {
        distanceInMiles = haversine(
            { latitude: row.geoIpLatestFetch.latitude, longitude: row.geoIpLatestFetch.longitude },
            { latitude: newGeoIpLatestFetch.latitude, longitude: newGeoIpLatestFetch.longitude }
        ) / 1609.344;
    }

    suspicionScore = suspicionScore + distanceInMiles;

    if (formattedUserAgent.isBot) {
        suspicionScore = suspicionScore * 4
    }

    if (distanceInMiles < 25) {
        if (row.geoIpLatestFetch?.timezone !== newGeoIpLatestFetch?.timezone) {
            suspicionScore = suspicionScore * 2
        }

        if (row.geoIpLatestFetch?.country !== newGeoIpLatestFetch?.country) {
            suspicionScore = suspicionScore * 2
        }

        if (row.geoIpLatestFetch?.continent !== newGeoIpLatestFetch?.continent) {
            suspicionScore = suspicionScore * 4
        }

        if (row.userAgent?.os?.family !== formattedUserAgent?.os?.family) {
            suspicionScore = suspicionScore * 2
        }

        if (row.userAgent?.client?.family !== formattedUserAgent?.client?.family) {
            suspicionScore = suspicionScore * 2
        }
    }

    if (suspicionScore >= 100) {
        // SEND A SECURITY NOTIFICTION TO ROW.USER IF VALID AND CREATE A WATCHDOG REPORT

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

        res.clearCookie("sessionId", cookieOptions);
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("sessionToken", cookieOptions);

        return { action: "REFRESH_PAGE" };
    };

    // If modified session token, delete session, clear cookies, and restart
    if (sessionToken) {
        if (crypto.createHash("sha256").update(sessionToken).digest("hex") !== row.sessionToken) {
            // CREATE AN TAMPER REPORT AUDIT

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

            res.clearCookie("sessionId", cookieOptions);
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("sessionToken", cookieOptions);

            return { action: "REFRESH_PAGE" };
        } else if (
            row.sessionTokenExpireDate &&
            DateTime.fromISO(row.sessionTokenExpireDate) < DateTime.now().toUTC().plus({ days: 10 })
        ) {
            // If session token expires in 10 or less days, generate a new rotation
            const in30Days = DateTime.now().toUTC().plus({ days: 30 }).toISO();
            sessionToken = id.gen("TOKEN");

            const hashedSessionToken = crypto.createHash("sha256").update(sessionToken).digest("hex");

            const result = db.accounts.query(
                `UPDATE sessions SET 
                    sessionToken = ?, 
                    sessionTokenExpireDate = ?
                    WHERE sessionId = ? LIMIT 1`,
                [
                    hashedSessionToken,
                    in30Days,
                    sessionId,
                ]
            );

            if (!result.success) {
                throw new AdvancedError({
                    code: 500,
                    message: "An error occurred while rotating session token",
                    details: result.error
                })
            }

            res.cookie("sessionToken", sessionToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${url.domain}`,
                path: "/",
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            });
        }
    }

    // If modified access token, delete session, clear cookies, and restart
    if (
        accessToken &&
        crypto.createHash("sha256").update(accessToken).digest("hex") !== row.accessToken
    ) {
        // CREATE AN TAMPER REPORT AUDIT

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

        const options: CookieOptions  = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
        }

        res.clearCookie("sessionId", options);
        res.clearCookie("accessToken", options);
        res.clearCookie("sessionToken", options);

        return { action: "REFRESH_PAGE" };
    } else if (
        !accessToken ||
        new Date(row.accessTokenExpireDate as string) < new Date()
    ) {
        // If expired access token, generate a new rotation
        const in5Minutes = DateTime.now().toUTC().plus({ minutes: 5 }).toISO();
        accessToken = id.gen("TOKEN");

        const hashedAccessToken = crypto.createHash("sha256").update(accessToken).digest("hex");

        const result = db.accounts.query(
            `UPDATE sessions SET 
                accessToken = ?, 
                accessTokenExpireDate = ?
                WHERE sessionId = ? LIMIT 1`,
            [
                hashedAccessToken,
                in5Minutes,
                sessionId,
            ]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while rotating access token",
                details: result.error
            })
        }

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 5, // 5 minutes
        });
    }

    // If invite is valid, save as cookie
    if (inviteCode !== row.inviteCode) {
        const inviteData: InviteType = await wc.callAPI(
            `https://${config.domains.api}/v2/invites/code/${inviteCode}`,
            { auth: `Bearer ${accessToken}` }
        );

        if (
            !inviteData?.isSuspended && inviteData?.isUnlimited ||
            !inviteData?.isSuspended && inviteData?.usesLeft > 0
        ) {
            res.cookie("inviteCode", inviteCode, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${url.domain}`,
                path: "/",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            });
        }
    } else {
        // Refesh the cookie so it doesn't expire
        res.cookie("inviteCode", inviteCode, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });
    }

    // Update the session row
    const updatedUserSessionResult = db.accounts.query(
        `UPDATE sessions SET
            geoIpLatestFetch = ?,
            geoIpLatestFetchDate = ?,
            userAgent = ?,
            inviteCode = ?,
            isConnected = ?,
            lastConnectedDate = ?
        WHERE sessionId = ?
        LIMIT 1`,
        [
            JSON.stringify(newGeoIpLatestFetch),
            now,
            JSON.stringify(formattedUserAgent),
            inviteCode,
            1,
            now,
            sessionId
        ]
    );

    if (!updatedUserSessionResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while updating session",
            details: updatedUserSessionResult.error
        })
    }

    // SAVE VISIT IN THE AUDIT DATABASE

    // Return session data // ADD PERMISSIONS
    return {
        userId: row.userId,
        expireDate: row.sessionTokenExpireDate
    };
}



































/* 

   } else {
        // login({ userId });

        // IF THE USER LOGS IN AT LEAST ONCE IN THE LAST 15 DAYS AND SESSION IS SOFT-TERMINATION (BEGINS DAY 20), 
        // REFRESH THE TOKEN INSTEAD OF EXPIRING IT IF WITHIN VALID SPACE COMPARED TO A HARD-TERMINATON

        // res.cookie("token", sessionTokenNew, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "none",
        //     domain: `.${url.domain}`,
        //     path: "/",
        //     maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        // });

        // EXTERNALLY IF ACCOUNT DOESN'T EXIST, CALL REGISTER ACCOUNT ELSE LOGIN
        // login({ method: "google", id: externalId });
        // registerAccount(sessionToken);

        // THEN return the rest of the login with the geo and perms and stuff
    }

    // If bot, return agent info with BOT PERMISSIONS ROLE
    // Else, call LOGIN(TOKEN) which returns the data and returns it to VALIDATESESSION();
}




*/


























































/*
// update totalDuration when leaving the site

    // log.network.info(req.headers).save();

/*

db.accounts.query(
    `INSERT INTO sessions (
        userId TEXT NOT NULL,
        geoIpFirstFetch TEXT,
        geoIpLatestFetch TEXT,
        geoIpLatestFetchDate TEXT,
        userAgent TEXT,
        inviteCode TEXT,
        token TEXT UNIQUE,
        sessionId TEXT UNIQUE,
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











/* // CRON TO DELETE EXPIRED OR TERMINATED SESSIONS
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




