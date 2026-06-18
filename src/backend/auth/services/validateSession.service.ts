import type { CookieOptions, Request, Response } from "express";
import net from "node:net";
import DeviceDetector from "node-device-detector";
import { DateTime } from "luxon";
import haversine from "haversine-distance"
import crypto from "crypto";

import { AdvancedError, URL } from "kage-library";

import { config } from "../../../../app.config.js";
import { db } from "../databases/db.js";
import { wc, id, log } from "../instances.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import fetchGeoIp from "../helpers/fetchGeoIp.js";
import { InviteType } from "../../_common/types/queries/invite.type.js";
import { UserAgentType } from "../types/userAgent.type.js";
import { SessionType } from "../types/session.type.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { AuditApiType } from "../../_common/types/queries/audit.type.js";
import { GeoIpType } from "../types/geoIp.type.js";
import { ValidSessionType } from "../../_common/types/validSession.type.js";

function normalizeIp(ip?: string | string[]) {
    if (!ip) return undefined;
    const value = Array.isArray(ip) ? ip[0] : ip;
    return value?.replace(/^::ffff:/, "").trim();
}

export function validateIp(req: Request): string {
    const cfIP = normalizeIp(req.headers["cf-connecting-ip"]);
    const xff = normalizeIp(req.headers["x-forwarded-for"]);
    const expressIP = normalizeIp(req.ip);
    const socketIP = normalizeIp(req.socket?.remoteAddress);

    if (cfIP && net.isIP(cfIP)) return cfIP;

    if (xff) {
        const firstXff = xff.split(",")[0].trim();
        if (net.isIP(firstXff)) return firstXff;
    }

    if (expressIP && net.isIP(expressIP)) return expressIP;

    if (socketIP && net.isIP(socketIP)) return socketIP;

    return "";
}

export default async function validateSession(
    req: Request, 
    res: Response,
    returnMfaToken: boolean = false
): Promise<ValidSessionType> {
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

    const now = DateTime.now().toUTC().toISO();

    // If first visit, generate a device token then save it
    if (!sessionId) {
        const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));
        const in15Minutes = DateTime.now().toUTC().plus({ minutes: 15 }).toISO();
        
        sessionId = id.gen("HASH");
        accessToken = id.gen("TOKEN");

        const hashedAccessToken = crypto.createHash("sha256").update(accessToken).digest("hex");

        const result = db.accounts.query(
            `INSERT INTO sessions (
                geoIpFirstFetch, 
                geoIpLatestFetch, 
                geoIpLatestFetchExpireDate,
                sessionId,
                accessToken,
                firstConnectedDate, 
                lastConnectedDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                JSON.stringify(newGeoIpLatestFetch), 
                JSON.stringify(newGeoIpLatestFetch), 
                in15Minutes,
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
    
    const rowGeoIpJSON: GeoIpType = JSON.parse(row.geoIpLatestFetch as unknown as string);
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

    // Session guard limites connected users to prevent server overflow
    // DEV NOTE: IF STAFF OR PARTNER ACCESS PERMISSIONS AND BOTS; ALL COUNT TOWARDS HARD LIMIT
    // ALSO, IF ALREADY LAST CONNECTED WITHIN 5 MINUTES, STILL COUNT AS CONNECTED AND ALLOW BYPSS
    const sessionsResult = db.accounts.query(
        `SELECT COUNT(*) AS count FROM sessions WHERE isConnected = 1`,
    );

    if (!sessionsResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while checking sessions",
            details: sessionsResult.error
        })
    }

    if (Number(sessionsResult.rows[0]?.count ?? 0) >= config.limits.softConnectedSessions) {
        log.client.warn(
            `Soft connected sessions limit reached: "${sessionId}" is being displayed a 503`
        ).save()
        // Renders the 503 page and refreshes every minute
        return { action: "DISPLAY_503" };
    }

    // If bot, return session here
    if (isUserAgentBot) {
        const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));
        const in15Minutes = DateTime.now().toUTC().plus({ minutes: 15 }).toISO();
        
        // Create audit log
        await wc.callAPI(
            `https://${config.domains.api}/v2/audit/create`,
            {
                method: "POST",
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: {
                    type: "authentications", 
                    source: { sessionId, geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent }, 
                    action: "VISIT",
                    origin: req.originalUrl
                } as AuditApiType
            }
        );

        const role = PlatformPermissionsService.getRole("robot");

        // Update the session row
        const updatedBotSessionResult = db.accounts.query(
            `UPDATE sessions SET
                geoIpLatestFetch = ?,
                geoIpLatestFetchExpireDate = ?,
                userAgent = ?,
                lastConnectedDate = ?
            WHERE sessionId = ?
            LIMIT 1`,
            [
                JSON.stringify(newGeoIpLatestFetch),
                in15Minutes,
                JSON.stringify(formattedUserAgent),
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
            sessionId,
            permissions: {
                value: role.value,
                array: role.array
            },
            locale: rowGeoIpJSON.locale,
            timezone: rowGeoIpJSON.timezone
        };
    }

    // Every 15 minutes check if session is suspicious. 
    // If suspicious delete session, clear cookies, and restart
    if (
        row.geoIpLatestFetchExpireDate &&
        new Date(row.geoIpLatestFetchExpireDate as string) < new Date()
    ) {
        let suspicionScore = 0;
        let distanceInMiles = 0;
        
        const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));
        const rowUserAgentJSON = JSON.parse(row.userAgent as unknown as string);

        if (
            rowGeoIpJSON.latitude && 
            rowGeoIpJSON.longitude &&
            newGeoIpLatestFetch.latitude && 
            newGeoIpLatestFetch.longitude
        ) {
            distanceInMiles = haversine(
                { latitude: rowGeoIpJSON.latitude, longitude: rowGeoIpJSON.longitude },
                { latitude: newGeoIpLatestFetch.latitude, longitude: newGeoIpLatestFetch.longitude }
            ) / 1609.344;
        }

        suspicionScore = suspicionScore + distanceInMiles;

        if (formattedUserAgent.isBot) {
            suspicionScore = suspicionScore * 4
        }

        if (distanceInMiles < 25) {
            if (rowGeoIpJSON?.timezone !== newGeoIpLatestFetch?.timezone) {
                suspicionScore = suspicionScore * 2
            }

            if (rowGeoIpJSON?.country !== newGeoIpLatestFetch?.country) {
                suspicionScore = suspicionScore * 2
            }

            if (rowGeoIpJSON?.continent !== newGeoIpLatestFetch?.continent) {
                suspicionScore = suspicionScore * 4
            }

            if (rowUserAgentJSON?.os?.family !== formattedUserAgent?.os?.family) {
                suspicionScore = suspicionScore * 2
            }

            if (rowUserAgentJSON?.client?.family !== formattedUserAgent?.client?.family) {
                suspicionScore = suspicionScore * 2
            }
        }

        if (suspicionScore >= 100) {
            // Create audit log
            await wc.callAPI(
                `https://${config.domains.api}/v2/audit/create`,
                {
                    method: "POST",
                    auth: `ApiSecret ${getEnv("API_SECRET")}`,
                    body: {
                        type: "authentications", 
                        source: { geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent },  
                        action: "DELETED",
                        changes: { 
                            new: { geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent }, 
                            old: { geoIp: rowGeoIpJSON, userAgent: rowUserAgentJSON } 
                        },
                        origin: req.originalUrl
                    } as AuditApiType
                }
            );

            // Send a notification to user
            // https://api.openprofile.app/v2/notification/send
            // https://api.openprofile.app/v2/notification/push ???
            // Used to send any kind of notification; uses ApiSecret auth

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
        } else {
            const in15Minutes = DateTime.now().toUTC().plus({ minutes: 15 }).toISO();

            const result = db.accounts.query(
                `UPDATE sessions SET 
                    geoIpLatestFetch = ?,
                    geoIpLatestFetchExpireDate = ?
                    WHERE sessionId = ? LIMIT 1`,
                [
                    JSON.stringify(newGeoIpLatestFetch),
                    in15Minutes,
                    sessionId,
                ]
            );

            if (!result.success) {
                throw new AdvancedError({
                    code: 500,
                    message: "An error occurred while updating geo ip",
                    details: result.error
                })
            }
        }
    }

    // CREATE A MFA TOKEN CHECK HERE

    // If modified session token, delete session, clear cookies, and restart
    if (sessionToken) {
        if (crypto.createHash("sha256").update(sessionToken).digest("hex") !== row.sessionToken) {
            const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));

            // Create audit log
            await wc.callAPI(
                `https://${config.domains.api}/v2/audit/create`,
                {
                    method: "POST",
                    auth: `ApiSecret ${getEnv("API_SECRET")}`,
                    body: {
                        type: "authentications", 
                        source: { geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent }, 
                        action: "DELETED",
                        changes: { 
                            new: { sessionToken: crypto.createHash("sha256").update(sessionToken).digest("hex") }, 
                            old: { sessionToken: row.sessionToken }
                        },
                        origin: req.originalUrl
                    } as AuditApiType
                }
            );

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
        const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));

        // Create audit log
        await wc.callAPI(
            `https://${config.domains.api}/v2/audit/create`,
            {
                method: "POST",
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: {
                    type: "authentications", 
                    source: { geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent },  
                    action: "DELETED",
                    changes: { 
                        new: { accessToken: crypto.createHash("sha256").update(accessToken).digest("hex") }, 
                        old: { accessToken: row.accessToken }
                    },
                    origin: req.originalUrl
                } as AuditApiType
            }
        );

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
        accessToken = id.gen("TOKEN");
        const in5Minutes = DateTime.now().toUTC().plus({ minutes: 5 }).toISO();

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
            userAgent = ?,
            inviteCode = ?,
            isConnected = ?,
            lastConnectedDate = ?
        WHERE sessionId = ?
        LIMIT 1`,
        [
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

    // Display member role for non-logged users
    const role = PlatformPermissionsService.getRole("guest");

    // Return session data
    return {
        sessionId,
        userId: row.userId,
        permissions: {
            value: role.value,
            array: role.array
        },
        locale: rowGeoIpJSON.locale,
        timezone: rowGeoIpJSON.timezone,
        // ...(returnMfaToken === true && { mfaToken })
    };
}