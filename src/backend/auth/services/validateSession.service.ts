import type { CookieOptions, Request, Response } from "express";
import DeviceDetector from "node-device-detector";
import { DateTime } from "luxon";
import haversine from "haversine-distance"
import crypto from "crypto";

import { URL } from "kage-library";

import { config } from "../../../../app.config.js";
import { db } from "../databases/db.js";
import { log } from "../instances.js";
import { wc, id } from "../../_common/instances.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import fetchGeoIp from "../helpers/fetchGeoIp.js";
import { InviteType } from "../../../_common/types/invite.type.js";
import { UserAgentType } from "../types/userAgent.type.js";
import { SessionType } from "../types/session.type.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { AuditApiType } from "../../../_common/types/audit.type.js";
import { GeoIpType } from "../../../_common/types/geoIp.type.js";
import { SessionActionType, ValidSessionType } from "../../../_common/types/validSession.type.js";
import { UserAccountType } from "../types/userAccount.type.js";
import validateIp from "../../_common/helpers/validateIp.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";

function clearAllCookies(
    res: Response, 
    cookieOptions: CookieOptions
): void {
    res.clearCookie("sessionId", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("sessionToken", cookieOptions);
    res.clearCookie("delegationToken", cookieOptions);
}

async function updateGeoIp(
    req: Request, 
    sessionId: string
): Promise<{ newGeoIpLatestFetch: GeoIpType; in15Minutes: string }> {
    const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));
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

    assertDbSuccess(result);

    return { newGeoIpLatestFetch, in15Minutes };
}

export default async function validateSession(
    req: Request, 
    res: Response,
    {
        returnMfaToken = false,
        returnAccessToken = false
    }: {
        returnMfaToken?: boolean;
        returnAccessToken?: boolean;
    } = {}
): Promise<ValidSessionType | { action: SessionActionType }> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const detector = new DeviceDetector();
    const url = new URL(`https://${config.domains.main}`);

    const userAgent = req.get("User-Agent") || req.get("user-agent") || "unknown"

    const inviteCode = req.query?.invite || req.cookies?.inviteCode;
    let sessionId = req.cookies?.sessionId;
    let accessToken = req.cookies?.accessToken;
    let sessionToken = req.cookies?.sessionToken;

    const delegationToken = req.cookies?.delegationToken;
    const delegatedAccounts: string[] = [];

    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: `.${url.domain}`,
        path: "/",
    }

    const now = DateTime.now().toUTC().toISO();

    // DEVELOPER NEEDED: Add a blacklisted IP list here later

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

        assertDbSuccess(result);

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
            maxAge: 1000 * 60 * config.limits.accessTokenExpireInMinutes
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

    assertDbSuccess(result);

    // If invalid session, clear cookies and restart
    if (result.rowCount < 1) {
        clearAllCookies(res, cookieOptions);

        return { action: "REFRESH_PAGE" };
    }

    const row = result.rows[0];

    const isSessionVoid =
        row.isTerminated ||
        row.sessionTokenExpireDate && new Date(row.sessionTokenExpireDate as string) < new Date();

    if (isSessionVoid) {
        clearAllCookies(res, cookieOptions);

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
    // If connected within the last 5 minutes (the time it takes to set isConnected = 0), do not block
    setTimeout(() => {
        const sessionsResult = db.accounts.query(
            `UPDATE sessions SET isConnected = 0 WHERE sessionId = ? LIMIT 1`,
            [sessionId]
        );

        assertDbSuccess(sessionsResult);
    }, 5 * 60 * 1000); // 5 Minutes; maybe use parseDuration("5m")

    const sessionsResult = db.accounts.query(
        `SELECT 1 AS count FROM sessions WHERE isConnected = 1`,
    );

    assertDbSuccess(sessionsResult);

    let action;

    if (!row.isConnected && (sessionsResult.rowCount >= config.limits.softConnectedSessions)) {
        const result = db.accounts.query<UserAccountType>(
            "SELECT permissions FROM users WHERE id = ? LIMIT 1",
            [row.userId]
        );

        assertDbSuccess(result);

        const userPermissions = result.rows[0]?.permissions;

        if (userPermissions && PlatformPermissionsService.has(userPermissions, "BYPASS_CONNECTION_LIMIT")) {
            if (sessionsResult.rowCount >= config.limits.hardConnectedSessions) {
                log.client.warn(
                    `Soft connected sessions limit reached: "${sessionId}" is being displayed a 503`
                ).save()

                return {
                    sessionId: sessionId || row?.sessionId,
                    action: "DISPLAY_503" 
                };
            } else {
                action = "DISPLAY_503_BYPASS";
            }
        } else {
            log.client.warn(
                `Soft connected sessions limit reached: "${sessionId}" is being displayed a 503`
            ).save()

            return { 
                sessionId: sessionId || row?.sessionId,
                action: "DISPLAY_503" 
            };
        }
    }

    // If bot, return session here
    if (isUserAgentBot) {
        const { newGeoIpLatestFetch, in15Minutes } = await updateGeoIp(req, sessionId);
        
        // Create audit log
        await wc.callAPI(
            `https://${config.domains.api}/v3/audit/create`,
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

        assertDbSuccess(updatedBotSessionResult);

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
            timezone: rowGeoIpJSON.timezone,
            inviteCode
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
                `https://${config.domains.api}/v3/audit/create`,
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
            // https://api.openprofile.app/v3/notification/send
            // https://api.openprofile.app/v3/notification/push ???
            // Used to send any kind of notification; uses ApiSecret auth

            const result = db.accounts.query(
                `DELETE FROM sessions WHERE sessionId = ? LIMIT 1`,
                [sessionId]
            );

            assertDbSuccess(result);

            clearAllCookies(res, cookieOptions);

            return { action: "REFRESH_PAGE" };
        } else {
            await updateGeoIp(req, sessionId);
        }
    }

    // If modified delegation token, delete session, clear cookies, and restart
    if (row.delegationToken) {
        const hashedToken = typeof delegationToken === "string"
            ? crypto.createHash("sha256").update(delegationToken).digest("hex")
            : null;

        if (!delegationToken || hashedToken !== row.delegationToken) {
            const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));

            // Create audit log
            await wc.callAPI(
                `https://${config.domains.api}/v3/audit/create`,
                {
                    method: "POST",
                    auth: `ApiSecret ${getEnv("API_SECRET")}`,
                    body: {
                        type: "authentications", 
                        source: { geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent }, 
                        action: "DELETED",
                        changes: { 
                            new: { delegationToken: hashedToken }, 
                            old: { delegationToken: row.delegationToken }
                        },
                        origin: req.originalUrl
                    } as AuditApiType
                }
            );

            const result = db.accounts.query(
                `DELETE FROM sessions WHERE sessionId = ? LIMIT 1`,
                [sessionId]
            );

            assertDbSuccess(result);

            clearAllCookies(res, cookieOptions);

            return { action: "REFRESH_PAGE" };
        } else {
            // Refesh the cookie so it doesn't expire

            res.cookie("delegationToken", delegationToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${url.domain}`,
                path: "/",
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            });
        }
    }

    // DEVELOPER NEEDED: Create an MFA token check here later

    // If modified session token, delete session, clear cookies, and restart
    if (row.sessionToken) {
        const hashedToken = typeof sessionToken === "string"
            ? crypto.createHash("sha256").update(sessionToken).digest("hex")
            : null;

        if (!sessionToken || hashedToken !== row.sessionToken) {
            const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));

            // Create audit log
            await wc.callAPI(
                `https://${config.domains.api}/v3/audit/create`,
                {
                    method: "POST",
                    auth: `ApiSecret ${getEnv("API_SECRET")}`,
                    body: {
                        type: "authentications", 
                        source: { geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent }, 
                        action: "DELETED",
                        changes: { 
                            new: { sessionToken: hashedToken }, 
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

            assertDbSuccess(result);

            clearAllCookies(res, cookieOptions);

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

            assertDbSuccess(result);

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
        // DEVELOPER NEEDED: Fix this when possible, if possible
        // DISABLED DUE TO FALSE RESETS (LIKELY DUE TO CONCURRENT CALLS)
        // eslint-disable-next-line no-constant-condition
        false
        // accessToken &&
        // crypto.createHash("sha256").update(accessToken).digest("hex") !== row.accessToken
    ) {
        // DISABLED DUE TO FALSE RESETS (LIKELY DUE TO CONCURRENT CALLS)
        /*const newGeoIpLatestFetch = await fetchGeoIp(validateIp(req));

        // Create audit log
        await wc.callAPI(
            `https://${config.domains.api}/v3/audit/create`,
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

        assertDbSuccess(result);

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
        res.clearCookie("delegationToken", cookieOptions);

        return { action: "REFRESH_PAGE" };*/
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

        assertDbSuccess(result);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * config.limits.accessTokenExpireInMinutes
        });
    }

    // If invite is valid, save as cookie
    if (inviteCode !== row.inviteCode) {
        const inviteData: InviteType = await wc.callAPI(
            `https://${config.domains.api}/v3/invites/code/${inviteCode}`,
            { auth: `Bearer ${accessToken}` }
        );

        if (
            inviteData.code &&
            (!inviteData?.isSuspended && inviteData?.isUnlimited ||
            !inviteData?.isSuspended && inviteData?.usesLeft > 0)
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

    assertDbSuccess(updatedUserSessionResult);

    let permissions;

    if (row.userId) {
        const result = db.accounts.query<UserAccountType>(
            "SELECT permissions FROM users WHERE id = ? LIMIT 1",
            [row.userId]
        );

        assertDbSuccess(result);

        permissions = {
            value: result.rows[0].permissions,
            array: PlatformPermissionsService.decode(
                result.rows[0].permissions
            )
        }
    } else {
        permissions = PlatformPermissionsService.getRole("guest");
    }

    if (row.delegationToken) {
        const result = db.accounts.query<SessionType>(
            `SELECT userId FROM sessions WHERE delegationToken = ?`,
            [row.delegationToken]
        );

        assertDbSuccess(result);

        if (result.rows?.length) {
            result.rows.forEach(row => {
                if (row.userId) {
                    delegatedAccounts.push(row.userId);
                }
            });
        }
    } else if (row.userId) {
        delegatedAccounts.push(row.userId);
    }

    // Return session data
    return {
        sessionId,
        userId: row.userId,
        permissions: {
            value: permissions.value,
            array: permissions.array
        },
        locale: rowGeoIpJSON.locale,
        timezone: rowGeoIpJSON.timezone,
        inviteCode,
        delegatedAccounts,
        // ...(returnMfaToken === true && { mfaToken })
        ...(returnAccessToken === true && { accessToken }),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        action
    };
}
