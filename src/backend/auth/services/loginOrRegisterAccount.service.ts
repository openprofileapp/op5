import { DateTime } from "luxon";
import crypto from "crypto";

import { AdvancedError } from "kage-library";

import { ValidSessionType } from '../../../_common/types/validSession.type.js';
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { i18n, id, wc } from "../../_common/instances.js";
import getUserAccountService from "./getUserAccount.service.js";
import { ConnectionNameType } from "../types/connection.type.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import updateToken from "../helpers/updateToken.js";
import { SessionType } from "../types/session.type.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import { ReservedAccountType } from "../types/reservedAccount.type.js";
import { BadgeNameType } from "../../../_common/types/badge.type.js";
import { NotificationNameType } from "../../../_common/types/notification.type.js";
import uploadFile from "../../_common/helpers/uploadFile.js";
import { snowflake } from "../instances.js";
import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";

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

export default async function loginOrRegisterAccountService({
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
 }: Props): Promise<ReturnTokensType> {
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
        const reservedResult = db.accounts.query<ReservedAccountType>(
            "SELECT * FROM reserved WHERE email = ? LIMIT 1", 
            [email]
        );

        assertDbSuccess(reservedResult);

        let formattedUsername = username;
        let permissions = PlatformPermissionsService.getRole("member");
        const badges: BadgeNameType[] = [];
        const notifications: NotificationNameType[] = [];
        let isAuraEnabled = 0;

        if (reservedResult.rowCount !== 0) {
            const row = reservedResult.rows[0];

            formattedUsername = row.username;
            email = row.email;

            if (row.isPartner) {
                permissions = PlatformPermissionsService.getRole("partner");
                badges.push("PARTNER");
                notifications.push("PARTNER_REGISTRATION");
            }

            if (row.isVerified) {
                permissions = PlatformPermissionsService.getRole("verified");
                badges.push("VERIFIED");
                notifications.push("VERIFIED_REGISTRATION");
            }

            if (row.isPartner && row.isVerified) {
                permissions = PlatformPermissionsService.getRole("verifiedPartner");
                notifications.push("VERIFIED_PARTNER_REGISTRATION");
            }

            if (row.isLifetimePremium) {
                permissions = PlatformPermissionsService.getRole("premium");
                badges.push("PREMIUM");
                notifications.push("LIFETIME_PREMIUM_REGISTRATION");
                isAuraEnabled = 1;
            }

            // DEVELOPER NEEDED: If reserved, verified, or lifetime premium, provide a notfication that 
            // tells the reason behind each on registration completion
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(email)) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.invalidEmail")
            })
        }

        const emailResult = db.accounts.query(
            "SELECT 1 FROM emails WHERE email = ? LIMIT 1", 
            [email]
        );

        assertDbSuccess(emailResult);

        if (emailResult.rowCount !== 0) {
            throw new AdvancedError({
                code: 409,
                message: i18n.t("responses.takenEmail")
            })
        }

        if (formattedUsername) {
            formattedUsername = formattedUsername.toLowerCase()
                .replace(/[^a-z0-9_.-]/g, "").slice(0, 24);

            if (formattedUsername.length < 3) {
                formattedUsername = formattedUsername.padEnd(3, "0");
            }

            const formattedUsernameNoSuffix = formattedUsername;

            while (true) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const usernameResult: { isAvailable: boolean } = await wc.callAPI(
                    `https://${config.domains.api}/v3/usernames`,
                    {
                        method: "POST",
                        auth: `ApiSecret ${getEnv("API_SECRET")}`,
                        body: { username: formattedUsername },
                    }
                );

                if (!usernameResult.isAvailable) {
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

        let formattedDisplayName = displayName;

        if (formattedDisplayName) {
            if (formattedDisplayName.length > 32) {
                formattedDisplayName = formattedDisplayName.slice(0, 32);
            }
        }

        let isPrecursor = false;
        let isPartnerInvited = false;

        const registrationsCountResult = db.accounts.query(
            "SELECT 1 FROM users"
        );

        assertDbSuccess(registrationsCountResult);

        if (registrationsCountResult.rowCount <= 503) {
            isPrecursor = true;

            permissions = PlatformPermissionsService.getRole("premium");

            badges.push("PREMIUM");
            badges.push("PRECURSOR");

            notifications.push("LIFETIME_PREMIUM_REGISTRATION");
            notifications.push("PRECURSOR_REGISTRATION");

            isAuraEnabled = 1;
        } else if (session.inviteCode) {
            isPartnerInvited = true;

            permissions = PlatformPermissionsService.getRole("premium");

            badges.push("PREMIUM");

            notifications.push("PREMIUM_REGISTRATION");
            notifications.push("PARTNER_CODE_USED");

            isAuraEnabled = 1;
        }

        const userId = snowflake.gen();

        let uploadedAvatar;
        let uploadedBanner;

        if (avatar) {
            uploadedAvatar = await uploadFile({
                folder: `users/avatars/${userId}`,
                fileInput: avatar
            });
        }

        if (banner) {
            uploadedBanner = await uploadFile({
                folder: `users/banners/${userId}`,
                fileInput: banner
            });
        }
        
        db.accounts.transaction(q => {
            const userResult = q(
                `INSERT INTO users (
                    id, 
                    hasEmail,
                    birthdate,
                    permissions,
                    locale,
                    timezone
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    1,
                    birthdate,
                    permissions.value,
                    session.locale,
                    session.timezone
                ]
            );

            assertDbSuccess(userResult);

            const emailResult = q(
                `INSERT INTO emails (
                    userId, 
                    email,
                    isPrimary,
                    isVerified
                ) VALUES (?, ?, ?, ?)`,
                [
                    userId,
                    email,
                    1,
                    isEmailVerified ? 1 : 0
                ]
            );

            assertDbSuccess(emailResult);

            const connectionResult = q(
                `INSERT INTO connections (
                    userId, 
                    connectionId,
                    connectionName,
                    connectionText
                ) VALUES (?, ?, ?, ?)`,
                [
                    userId,
                    externalConnectionId,
                    externalConnectionName,
                    externalConnectionText
                ]
            );

            assertDbSuccess(connectionResult);

            if (isPrecursor) {
                const subscriptionResult = q(
                    `INSERT INTO subscriptions (
                        id, 
                        userId,
                        plan,
                        method
                    ) VALUES (?, ?, ?, ?)`,
                    [
                        snowflake.gen(),
                        userId,
                        "lifetime-premium",
                        "precursor"
                    ]
                );

                assertDbSuccess(subscriptionResult);
            } else if (isPartnerInvited) {
                const subscriptionResult = q(
                    `INSERT INTO subscriptions (
                        id, 
                        userId,
                        plan,
                        method
                    ) VALUES (?, ?, ?, ?)`,
                    [
                        snowflake.gen(),
                        userId,
                        "premium-trial",
                        "partner"
                    ]
                );
                
                assertDbSuccess(subscriptionResult);
            }
        });

        const postRegisterResult: { ok: boolean } = await wc.callAPI(
            `https://${config.domains.api}/v3/postregister`,
            {
                method: "POST",
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: {
                    id: userId,
                    username: formattedUsername,
                    displayName,
                    avatar: uploadedAvatar?.path,
                    banner: uploadedBanner?.path,
                    isAuraEnabled,
                    about,
                    theme,
                    badges,
                    notifications
                }
            }
        );

        if (!postRegisterResult.ok) {
            throw new AdvancedError({
                code: 500,
                message: i18n.t("responses.failedAccountRegistration")
            })
        }


        
        
        
        return console.log("ok");
        
        
 

            











        
        
        


    }
}


/*

    try {
        if (!row) {
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




/*
    // CALL THE UPDATE USERS API https://api.openprofile.app/v3/users/ID/update
    // USE API SECRET

    // Return
    return {
        // UPDATE_SESSION_FUNCTION
    };
}
*/

/*
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

                    database.query("accounts", "INSERT INTO badges (user, type) VALUES (?, ?)", [account.id, "premium"]);
                }
        }













// Subscribe the user to lifetime premium
            
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



// CHECK THE BADGES TO ENSURE THERE AREN'T DUPES AT THE END
*/
