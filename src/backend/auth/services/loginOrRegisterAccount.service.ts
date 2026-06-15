import type { Response } from 'express';
import { DateTime } from "luxon";
import crypto from "crypto";

import { AdvancedError } from "kage-library";

import { db, id, snowflake, } from "../server.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import getUserAccountByExternalId from "./getUserAccountByExternalId.service.js";
import getUserAccountByEmail from "./getUserAccountByEmail.service.js";
import { ReservedAccountType } from "../../_common/types/queries/reservedAccount.type.js";

type Props = {
    sessionId: string;
    email?: string;
    isEmailVerified?: boolean;
    phoneNumber?: string;
    isPhoneNumberConfirmed?: boolean;
    password?: string;
    birthdate?: string;
    locale?: string;
    timezone?: string;
    hasReadTerms?: boolean;
    username?: string;
    displayName?: string;
    avatar?: string;
    banner?: string;
    about?: string;
    theme?: string;
    externalConnectionName?: string;
    externalConnectionId?: string;
    externalConnectionText?: string;
}

function updateSession(userId: string, sessionId: string) {
    const sessionToken = id.gen("TOKEN");
    const in30Days = DateTime.now().toUTC().plus({ days: 30 }).toISO();

    const hashedSessionToken = crypto.createHash("sha256").update(sessionToken).digest("hex");

    const result = db.accounts.query(
        `UPDATE sessions SET 
            userId = ?,
            sessionToken = ?, 
            sessionTokenExpireDate = ?
            WHERE sessionId = ? LIMIT 1`,
        [
            userId,
            hashedSessionToken,
            in30Days,
            sessionId,
        ]
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while saving session token",
            details: result.error
        })
    }

    return sessionToken;
}

export default function loginOrRegisterAccount({
    sessionId,
    email,
    isEmailVerified,
    // phoneNumber,
    // isPhoneNumberConfirmed,
    // password,
    // birthdate,
    locale,
    timezone,
    // hasReadTerms,
    username,
    displayName,
    avatar,
    banner,
    // about,
    theme,
    externalConnectionName,
    externalConnectionId,
    externalConnectionText
 }: Props) {
    let userAccount;

    if (!email) {
        throw new AdvancedError({
            code: 400,
            message: "Email missing"
        })
    }

    if (!isEmailVerified) {
        throw new AdvancedError({
            code: 400,
            message: "Email not verified"
        })
    }

    /* 
    ————————————————————————————————————————————————————————————————
    Login to an existing account
    ———————————————————————————————————————————————————————————————— 
    */

    // Check connections for valid account
    if (externalConnectionName && externalConnectionId) {
        userAccount = getUserAccountByExternalId(externalConnectionName, externalConnectionId);
    }

    // If connections are valid, update them then return
    if (userAccount && userAccount.id) {
        const connectionResult = db.accounts.query(
            `UPDATE connections SET
                connectionText = ?
            WHERE userId = ?
            AND connectionName = ?
            LIMIT 1`,
            [
                externalConnectionText,
                userAccount.id,
                externalConnectionName
            ]
        );

        if (!connectionResult.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while checking connections",
                details: connectionResult.error
            })
        }

        /*// MAKE A FUNCTION TO UPDATE ACTIVE SESSION AND SEND COOKIE
        // Using sessionId as what to update

        // IF MFA; GIVE A TEMP TOKEN TO VALIDATE MFA BEFORE SESSION TOKEN
        // ADD MFA_TOKEN TO SESSIONS AND AN EXPIRE AFTER 15 MINUTES

        {
            "challenge_id": "abc123",
            "user_id": 42,
            "status": "PENDING_MFA",
            "expires_at": "now + 5–15 min",
            "attempts": 0,
            "device_fingerprint": "...optional..."
        }

        // ADD AWAITING MFA ON SESSION OR SMTH*/

        // Return session token
        return updateSession(userAccount.id, sessionId);
    }

    // If Google, check email for valid account and attempt to fix broken ids
    if (externalConnectionName === "google" && 
        externalConnectionId && 
        email
    ) { 
        userAccount = getUserAccountByEmail(email); 
    }

    // If email is valid, return
    if (userAccount?.id) {
        // Update incase Google have issues with their ids
        // updateUserAccountExternalId(COMMON_VARIABES_HERE_INCLUDING_ID)
        return {
            // UPDATE_SESSION_FUNCTION
        };
    }
  
    /* 
    ————————————————————————————————————————————————————————————————
    Register a new account
    ———————————————————————————————————————————————————————————————— 
    */

    let formattedUsername = username;
    const permissions = PlatformPermissionsService.getRole("member");
    let isAuraEnabled = 0;

    // Check if the account is reserved
    const reservedResult = db.accounts.query<ReservedAccountType>(
        "SELECT COUNT(*) AS count FROM reserved WHERE email = ? LIMIT 1", 
        [email]
    );

    if (!reservedResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while checking reserved accounts",
            details: reservedResult.error
        })
    }

    if (reservedResult.rowCount === 0) {
        // Validate email then check if taken
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(email)) {
            throw new AdvancedError({
                code: 400,
                message: "Invalid email"
            })
        }

        const emailResult = db.accounts.query(
            "SELECT COUNT(*) AS count FROM emails WHERE email = ? LIMIT 1", 
            [email]
        );

        if (!emailResult.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while checking emails",
                details: emailResult.error
            })
        }

        if (emailResult.rowCount !== 0) {
            throw new AdvancedError({
                code: 409,
                message: "Email taken"
            })
        }

        // Validate username then check if taken; if taken, assign a random number
        if (formattedUsername) {
            formattedUsername = formattedUsername.toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 24);

            if (formattedUsername.length < 3) {
                formattedUsername = formattedUsername.padEnd(3, "0");
            }

            const formattedUsernameNoSuffix = formattedUsername;

            while (true) {
                const usernameResult = db.accounts.query(
                    `SELECT COUNT(*) AS count FROM users 
                    WHERE username = ? OR usernameOld = ? OR id = ? LIMIT 1`, 
                    [formattedUsername, formattedUsername, formattedUsername]
                );

                if (!usernameResult.success) {
                    throw new AdvancedError({
                        code: 500,
                        message: "An error occurred while checking usernames",
                        details: usernameResult.error
                    })
                }

                if (usernameResult.rowCount !== 0) {
                    const suffix = `_${Math.floor(10000 + Math.random() * 90000)}`

                    if (formattedUsername.length <= 18) {
                        formattedUsername = formattedUsernameNoSuffix + suffix;
                    } else {
                        formattedUsername = formattedUsernameNoSuffix.slice(0, 18) + suffix;
                    }
                } else {
                    break;
                }
            }
        }
    } else {
        // Load reserved account
        const row = reservedResult.rows[0];
        let permissionsArray = permissions.array;

        email = row.email;
        formattedUsername = row.username;

        if (row.isPartner) {
            permissionsArray = [
                ...permissionsArray,
                "CASHOUT_REVENUE",
                "PARTNER_ACCESS"
            ];

            // ADD BADGE
        }

        if (row.isVerified) {
            permissionsArray = [
                ...permissionsArray,
                "VERIFIED_ACCESS",
                "CREATE_MEMORIES"
            ];

            // ADD BADGE
        }

        if (row.isLifetimePremium || row.isPartner) {
            permissionsArray = [
                ...permissionsArray,
                "BYPASS_EXTERNAL_ADS",
                "PREMIUM_ACCESS",
                "USE_CUSTOM_THEMES"
            ];

            isAuraEnabled = 1;

            // ADD BADGE
        }

        permissions.array = permissionsArray;
        permissions.value = PlatformPermissionsService.encode(permissionsArray);

        // SEND A NOTIFICATION TO ACCOUNT ABOUT VERIFICATION AND STUFF
        // USE API SECRET
    }

    // Validate display name
    let formattedDisplayName = displayName;

    if (formattedDisplayName) {
        if (formattedDisplayName.length > 32) {
            formattedDisplayName = formattedDisplayName.slice(0, 32);
        }
    }

    // First 500 registrations get lifetime premium (3 more to not count official accounts)
    const registrationsResult = db.accounts.query(
        "SELECT COUNT(*) AS count FROM users"
    );

    if (!registrationsResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while checking registrations",
            details: registrationsResult.error
        })
    }

    if (registrationsResult.rowCount <= 503) {


        /*    // Save to subscribtions database
            // add badge
            // add precursor award

            let permissionsArray = [
                    ...permissions.array,
                    "BYPASS_EXTERNAL_ADS",
                    "PREMIUM_ACCESS",
                    "USE_CUSTOM_THEMES"
                ];
            }

            permissions.array = permissionsArray;
            permissions.value = PlatformPermissionsService.encode(permissionsArray);

            isAuraEnabled = 1;
        }*/
    } else {
        // ACCEPT AND USE INVITES AND UPDATE USE
    }

    // Generate account info
    const id = snowflake.gen();

    // UPLOAD AVATAR AND BANNER

    // Save to database
    const result = q(
        `INSERT INTO users (
            id, 
            hasEmail, 
            permissions,
            locale,
            timezone
        ) VALUES (?, ?, ?, ?, ?)`,
        [
            id,
            1,
            permissions.value,
            locale,
            timezone
        ]
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while saving account",
            details: result.error
        })
    }

    // CALL THE UPDATE USERS API https://api.openprofile.app/v2/users/ID/update
    // USE API SECRET

    // Return
    return {
        // UPDATE_SESSION_FUNCTION
    };
}
























/*

    try {
        if (!row) {
            const count = Math.ceil((database.query("accounts", "SELECT COUNT(*) AS count AS length FROM public"))?.length);
            console.log(count)
                account.aura = 1;

                // Subscribe the user to lifetime premium
                database.query("accounts", "INSERT INTO subscriptions (user, id, plan, method) VALUES (?, ?, ?, ?)", [account.id, identifier.generate("SUBSCRIPTION"), "lifetime-premium", "precursor"]);
                account.permissions = permissions.update(account.permissions, ["PREMIUM"]);
                
                // Assign precursor and premium badges
                database.query("accounts", "INSERT INTO badges (user, type) VALUES (?, ?)", [account.id, "precursor"]);
                database.query("accounts", "INSERT INTO badges (user, type) VALUES (?, ?)", [account.id, "premium"]);
 
                // Assign a join to the partner invite code
                if (req.session.invite?.code) {
                    const partner = database.query("partners", `SELECT * FROM codes WHERE code = ?`, [req.session.invite?.code]);
                    if (partner) {
                        database.query("partners", "INSERT INTO uses (user, code) VALUES (?, ?)", [account.id, partner.code]);
                        await notification(null, partner, "PARTNER_REGISTER", partner.user);
                    }
                }

                // Assign 3 invite codes to the account
                database.query("accounts", "INSERT INTO invites (user, code) VALUES (?, ?)", [account.id, identifier.generate("INVITE")]);
                database.query("accounts", "INSERT INTO invites (user, code) VALUES (?, ?)", [account.id, identifier.generate("INVITE")]);
                database.query("accounts", "INSERT INTO invites (user, code) VALUES (?, ?)", [account.id, identifier.generate("INVITE")]);
            } else {
                // Accept invite code usages
                if (req.session.invite?.code) {
                    database.query("accounts", `UPDATE invites SET invited = ?, used = ?, used_date = ? WHERE code = ?`, [account.id, 1, timestamp.generate("0s", "datetime"), req.session.invite.code]);

                    if (req.session.invite.type == "partner") {
                        // Assign a join to the partner invite code
                        const partner = database.query("partners", `SELECT * FROM codes WHERE code = ?`, [req.session.invite?.code]);
                        if (partner) {
                            database.query("partners", "INSERT INTO uses (user, code) VALUES (?, ?)", [account.id, partner.code]);
                            await notification(null, partner, "PARTNER_REGISTER", partner.user);
                        }
                    } else {
                        // Check if the inviter was invited by a partner, if so give credit to the partner
                        const invite = database.query("accounts", `SELECT * FROM invites WHERE code = ?`, [req.session.invite?.code]);
                        if (invite) {
                            const row = database.query("partners", `SELECT * FROM uses WHERE user = ?`, [invite.user]);
                            if (row) {
                                const partner = database.query("partners", `SELECT * FROM codes WHERE code = ?`, [row.code]);
                                if (partner) {
                                    database.query("partners", "INSERT INTO uses (user, code) VALUES (?, ?)", [account.id, partner.code]);
                                    await notification(null, partner, "PARTNER_REGISTER", partner.user);
                                }
                            }
                        }
                    }

                    account.aura = 1;

                    // Subscribe the user to premium
                    database.query("accounts", "INSERT INTO subscriptions (user, id, plan, method, date_end) VALUES (?, ?, ?, ?, ?)", [account.id, identifier.generate("SUBSCRIPTION"), "premium", "invite", timestamp.generate(req.session.invite?.type == "partner" ? "7d" : "30d", "datetime")]);
                    account.permissions = permissions.update(account.permissions, ["PREMIUM"]);

                    // Assign premium badge
                    database.query("accounts", "INSERT INTO badges (user, type) VALUES (?, ?)", [account.id, "premium"]);
                }
            }

            if (external.avatar) {account.avatar = await upload(`users/${account.id}`, identifier.generate("HASH"), external.avatar);}
            if (external.banner) {account.banner = await upload(`users/${account.id}`, identifier.generate("HASH"), external.banner);}

            // Preset the aura based on ghost color
            switch (req.session.account.public.ghost.color) {
                case "gray": account.aura_primary = "#aaaaaa"; break;
                case "red": account.aura_primary = "#ce1616"; break;
                case "orange": account.aura_primary = "#e85b0f"; break;
                case "yellow": account.aura_primary = "#efbe0b"; break;
                case "green": account.aura_primary = "#13a10e"; break;
                case "blue": account.aura_primary = "#1540cf"; break;
                case "purple": account.aura_primary = "#700cb7"; break;
                case "pink": account.aura_primary = "#ff61b5"; break;
            }

            // Save account to the database and follow @openprofile
            if (integration == "discord") {database.query("accounts", "INSERT INTO connections (user, name, text, id, verified, visibility) VALUES (?, ?, ?, ?, ?, ?)", [account.id, "discord", `@${external.username}`, external.id, 1, "public"]);}
            if (integration == "google") {database.query("accounts", "INSERT INTO connections (user, name, text, id, verified, visibility) VALUES (?, ?, ?, ?, ?, ?)", [account.id, "google", null, external.sub, 1, "private"]);}
            if (integration == "github") {database.query("accounts", "INSERT INTO connections (user, name, text, id, verified, visibility) VALUES (?, ?, ?, ?, ?, ?)", [account.id, "github", `@${external.username}`, external.id, 1, "public"]);}
            database.query("accounts", "INSERT INTO emails (user, email, confirmed) VALUES (?, ?, ?)", [account.id, external.email, external.verified == true ? 1 : 0 || 1]);
            database.query("accounts", "INSERT INTO private (id, email, birthdate, locale, timezone, permissions) VALUES (?, ?, ?, ?, ?, ?)", [account.id, 1, null, req.session.geo.last.locale, req.session.geo.last.timezone, account.permissions]);
            database.query("accounts", "INSERT INTO public (ghost, id, username, display_name, avatar, banner, about, theme, aura, aura_primary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [req.session.account.public.ghost, account.id, account.username, account.display_name || null, account.avatar?.path || null, account.banner?.path || null, external.about || null, req.session.account.public.theme, account.aura, account.aura_primary]);
            interact(account, "9534968913312158", "FOLLOW");

            // Create a new session
            const token = identifier.generate("TOKEN");
            database.query("sessions", `UPDATE permanent SET user = ?, token = ? WHERE id = ?`, [account.id, token, req.session.id]);

            // Set a token cookie on client
            res.cookie("token", token, {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${domains.release}`
            });

            activity(account.id, null, "ACCOUNT_REGISTER");
            
            res.redirect(routes.release);
        } else {
            // Update or add the connections if needed
            if (integration === "discord") {database.query("accounts", "INSERT INTO connections (user, name, text, id, verified, visibility) VALUES (?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " + "text = VALUES(text), " + "id = VALUES(id), " + "verified = VALUES(verified), " + "visibility = VALUES(visibility)",
                [account.id, "discord", `@${external.username}`, external.id, 1, "public"]
            );}

            if (integration === "google") {database.query("accounts", "INSERT INTO connections (user, name, text, id, verified, visibility) VALUES (?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " + "text = COALESCE(VALUES(text), text), " + "id = VALUES(id), " + "verified = VALUES(verified), " + "visibility = VALUES(visibility)",
                [account.id, "google", null, external.sub, 1, "private"]
            );}

            if (integration === "github") {database.query("accounts", "INSERT INTO connections (user, name, text, id, verified, visibility) VALUES (?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " + "text = COALESCE(VALUES(text), text), " + "id = VALUES(id), " + "verified = VALUES(verified), " + "visibility = VALUES(visibility)",
                [account.id, "github", `@${external.username}`, external.id, 1, "private"]
            );}

            // Create a new session
            const token = identifier.generate("TOKEN");
            database.query("sessions", `UPDATE permanent SET user = ?, token = ? WHERE id = ?`, [row.user, token, req.session.id]);

            // Set a token cookie on client
            res.cookie("token", token, {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${domains.release}`
            });

            res.redirect(routes.release);
        }
    } catch (error) {
        forward_status("error", "server", "/v2/login", error.code, error.message);
        return res.status(500).send(error.message);
    }

*/