import { DateTime } from "luxon";
import crypto from "crypto";

import { AdvancedError } from "kage-library";

import { ValidSessionType } from '../../../_common/types/validSession.type.js';
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { i18n, id } from "../../_common/instances.js";
import getUserAccountService from "./getUserAccount.service.js";
import { ConnectionNameType } from "../types/connection.type.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import updateToken from "../helpers/updateToken.js";
import { SessionType } from "../types/session.type.js";

type Props = {
    session: ValidSessionType;
    delegationToken: string;
    email?: string;
    isEmailVerified?: boolean;
    phoneNumber?: string;
    isPhoneNumberConfirmed?: boolean;
    password?: string;
    birthdate?: string;
    hasReadTerms?: boolean;
    username?: string;
    displayName?: string;
    avatar?: string;
    banner?: string;
    about?: string;
    theme?: string;
    externalConnectionName?: ConnectionNameType;
    externalConnectionId?: string;
    externalConnectionText?: string;
}

type ReturnTokensType = {
    sessionId?: string;
    accessToken?: string;
    mfaToken?: string;
    sessionToken?: string;
    delegationToken?: string;
}

function addDelegation(
    userId: string, 
    sessionId: string,
    delegationToken?: string
): ReturnTokensType {
    const sessionResult = db.accounts.query<SessionType>(
        `SELECT * FROM sessions WHERE sessionId = ? LIMIT 1`,
        [sessionId]
    );

    assertDbSuccess(sessionResult)

    const sessionRow = sessionResult?.rows[0];

    assertNotNull(sessionRow);

    if (sessionRow.userId === userId) return {};

    if (!delegationToken) {
        delegationToken = updateToken(sessionRow.sessionId, "DELEGATION");

        const hashedDelegationToken = crypto.createHash("sha256").update(delegationToken).digest("hex");

        const updateDelegationTokenResult = db.accounts.query(
            `UPDATE sessions SET delegationToken = ? WHERE sessionId = ? LIMIT 1`,
            [
                hashedDelegationToken,
                sessionId,
            ]
        );

        assertDbSuccess(updateDelegationTokenResult);
    }

    const hashedDelegationToken = crypto.createHash("sha256").update(delegationToken).digest("hex");

    const existingDelegationsResult = db.accounts.query(
        `SELECT 1 FROM sessions WHERE delegationToken = ?`,
        [hashedDelegationToken]
    );

    assertDbSuccess(existingDelegationsResult);

    if (existingDelegationsResult.rowCount >= 8) {
        throw new AdvancedError({
            code: 400,
            message: i18n.t("responses.delegationLimit")
        });
    }

    const newSessionId = id.gen("HASH");
    const now = DateTime.now().toUTC().toISO();

    const updateResult = db.accounts.query(
        `INSERT INTO sessions (
            sessionId,
            userId,
            geoIpFirstFetch,
            geoIpLatestFetch,
            geoIpLatestFetchExpireDate,
            userAgent,
            inviteCode,
            delegationToken,
            isConnected,
            firstConnectedDate,
            lastConnectedDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            newSessionId,
            userId,
            sessionRow.geoIpLatestFetch,
            sessionRow.geoIpLatestFetch,
            sessionRow.geoIpLatestFetchExpireDate,
            sessionRow.userAgent,
            sessionRow.inviteCode,
            hashedDelegationToken,
            1,
            now,
            now
        ]
    );

    assertDbSuccess(updateResult);

    const accessToken = updateToken(newSessionId, "ACCESS");
    const sessionToken = updateToken(newSessionId, "SESSION");

    return {
        sessionId: newSessionId,
        accessToken,
        sessionToken,
        delegationToken
    };
}

export default function loginOrRegisterAccountService({
    session,
    delegationToken,
    email,
    isEmailVerified,
    // phoneNumber,
    // isPhoneNumberConfirmed,
    // password,
    birthdate,
    // hasReadTerms, // Never set manually unless a platform operated account
    username,
    displayName,
    avatar,
    banner,
    about,
    theme,
    externalConnectionName,
    externalConnectionId,
    externalConnectionText
 }: Props): ReturnTokensType {
    let account;

    assertNotNull([
        session.sessionId,
        session.permissions 
    ])

    if (!email) {
        throw new AdvancedError({
            code: 400,
            message: i18n.t("responses.missingEmail")
        })
    }

    if (!isEmailVerified) {
        throw new AdvancedError({
            code: 400,
            message: i18n.t("responses.unverifiedEmail")
        })
    }

    /* 
    ————————————————————————————————————————————————————————————————
    Login to an existing account
    ———————————————————————————————————————————————————————————————— 
    */

    if (externalConnectionName && externalConnectionId) {
        account = getUserAccountService({
            email,
            externalConnectionName,
            externalConnectionId
        });
    }

    if (account && account.id) {
        const result = db.accounts.query(
            `UPDATE connections SET
                connectionText = ?
            WHERE userId = ?
            AND connectionName = ?
            LIMIT 1`,
            [
                externalConnectionText,
                account.id,
                externalConnectionName
            ]
        );

        assertDbSuccess(result);

        if (account.isMfaEnabled) {
           /* return {
                mfaToken: createMfaChallenge(
                    account.totpSecret, 
                    account.id,
                    session.sessionId
                )
            };*/
        } else {
            if (session.userId) {
                return addDelegation(account.id, session.sessionId, delegationToken);
            }

            return {
                sessionToken: updateToken(
                    session.sessionId, 
                    "SESSION", 
                    { userId: account.id }
                )
            };
        }
    } else {
        ///////////////////////////////////////
        console.log("CREATE NEW ACCOUNT HERE");
        ///////////////////////////////////////
    }
}














/*

    // If Google, check email for valid account and attempt to fix broken ids
    if (externalConnectionName === "google" && 
        externalConnectionId && 
        email
    ) { 
        try {
            userAccount = getUserAccountByEmail(email);
        } catch {
            userAccount = null;
        }
    }

    // If email is valid, return
    if (userAccount && userAccount.id) {
        // Update incase Google have issues with their ids
        // updateUserAccountExternalId(COMMON_VARIABES_HERE_INCLUDING_ID)

        // Return session or mfa token
        if (userAccount.mfaSecret) {
            return createMfaChallenge(
                userAccount.mfaSecret, 
                userAccount.id, 
                session.sessionId
            );
        } else {
            if (session.userId) {
                addDelegation(userAccount.id, session.sessionId, delegationToken);
            }

            return updateSessionToken(userAccount.id, session.sessionId);
        }
    }
  */
    /* 
    ————————————————————————————————————————————————————————————————
    Register a new account
    ———————————————————————————————————————————————————————————————— 
    */
/*
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
        }
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
            session.locale,
            session.timezone
        ]
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while saving account",
            details: result.error
        })
    }

    // CALL THE UPDATE USERS API https://api.openprofile.app/v3/users/ID/update
    // USE API SECRET

    // Return
    return {
        // UPDATE_SESSION_FUNCTION
    };
}
*/























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
        forward_status("error", "server", "/v3/login", error.code, error.message);
        return res.status(500).send(error.message);
    }

*/