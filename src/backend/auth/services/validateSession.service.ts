import type { Request, Response } from 'express';
import net from "node:net";
import DeviceDetector from "node-device-detector";

import { AdvancedError, QueryResult, URL } from 'kage-library';

import { config } from '../../../../app.config.js';
import { db, log } from '../server.js';
import { BotAccount } from '../../_common/types/queries/botAccount.type.js';
import { UserAccount } from '../../_common/types/queries/userAccount.type.js';
import PlatformPermissionsService from '../../_common/services/platformPermissions.service.js';
import fetchGeoIp from '../helpers/fetchGeoIp.js';

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
    // BOT ACCOUNT (MOVE THIS TO login())
    const authHeader = req.headers.authorization as string || req.headers.Authorization as string;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const authToken = authHeader.split(" ")[1];

        const botResult: QueryResult = db.accounts.query("SELECT * FROM bots WHERE token = ? LIMIT 1", [authToken]);

        if (botResult.success) {
            if (botResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Account not found" });

            const row = botResult.rows[0] as BotAccount;

            if (row.isDeleted) throw new AdvancedError({ code: 404, message: "Account not found" });
            if (row.isSuspended) throw new AdvancedError({ code: 403, message: "This account is suspended" });

            const userResult: QueryResult = db.accounts.query("SELECT * FROM users WHERE id = ? LIMIT 1", [row.ownerId]);

            if (userResult.success) {
                if (userResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Account not found" });

                const row = userResult.rows[0] as UserAccount;

                if (row.isDeleted) throw new AdvancedError({ code: 404, message: "Account not found" });
                if (row.isSuspended) throw new AdvancedError({ code: 403, message: "This account is suspended" });

            } else {
                throw new AdvancedError({ 
                    code: 500, 
                    message: userResult.error as string || "An error occurred while fetching account" 
                });
            }
    
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { token, isSuspended, isDeleted, ...rest } = row;
            
            return {
                ...rest,
                permissions: {
                    value: rest.permissions,
                    array: PlatformPermissionsService.decode(rest.permissions)
                }
            };
        } else {
            throw new AdvancedError({ 
                code: 500, 
                message: botResult.error as string || "An error occurred while fetching account" 
            });
        }
    }

    // USER ACCOUNT
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const detector = new DeviceDetector();
    
    const userAgent = req.get('User-Agent') || req.get('user-agent') || "unknown"
    const inviteCode = req.query?.inviteCode || req.cookies?.inviteCode;
    const clientToken = req.cookies?.token;
    const validatedIp = validateIp(req);

    const userAgentJSON = detector.detect(userAgent);
    const userAgentBotJSON = detector.parseBot?.(userAgent) || {};

    const isUserAgentBot =
        Object.keys(userAgentBotJSON || {}).length > 0 ||
        // Additional wildcards not caught by detector.parseBot
        /(axios|bot|crawl|spider|scraper|fetcher|monitor|validator|node)/i
        .test(userAgent);

    const formattedUserAgent = {
        ...userAgentJSON,
        isBot: isUserAgentBot,
        ...(isUserAgentBot && {
            bot: userAgentBotJSON
        })
    };

    if (true) { // isUserAgentBot
        const role = PlatformPermissionsService.getRole("robot")

        return {
            geoIp: await fetchGeoIp(validatedIp), // Need a FIRST and LATEST to compare security
            userAgent: formattedUserAgent,
            permissions: {
                value: role.value,
                array: role.array
            }
        };
    } else {
        // CHECK IF THE USER LIMIT IS MATCHED USING WEBSOCKET CLIENT COUNT

        // login(clientToken)
    }

    // If bot, return agent info with BOT PERMISSIONS ROLE
    // Else, call LOGIN(TOKEN) which returns the data and returns it to VALIDATESESSION();
}






    



    // log.network.info(req.headers).save();

/*

        // Parse the agent, if a robot, limit access
        
        // Block robots from scraping
        if (session.agent.bot) {
            // Revoke some permissions then log the interaction in watchdog
            session.account.private.permissions = { value: permissions.role("robot").value, array: permissions.role("robot").array}
            session.geo.last = await geolocation(ip); // Fetch geolocation
            const message = `Robot "${session.agent.name || "unknown"}" attempted to scrape`;
            log("warning", "watchdog", message);
            database.query("watchdog",`INSERT INTO authenticate (agent, ip, message) VALUES (?, ?, ?)`, [session.agent.string, session.geo.last.ip, message]);
            return res.json(clean(session));
        }

        // If server is too busy, block new users, else allow access
        if (guard.online.size >= guard.max) {return res.status(503).send("");}

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
        
        // If session is terminated, restart authentication
        if (session.terminated) { 
            log("warning", "authentication", `Session for "${session.account.public.ghost.name || "unknown"}" is terminated`);
            return res.status(401).send("");
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