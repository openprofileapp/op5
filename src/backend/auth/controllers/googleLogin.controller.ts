import type { Request, Response } from 'express';

import { AdvancedError } from 'kage-library';

import { log, wc } from '../server.js';
import getEnv from '../../../_common/helpers/getEnv.js';
import { config } from '../../../../app.config.js';
import getUserAccountByExternalId from '../services/getUserAccountByExternalId.service.js';
import getUserAccountByEmail from '../services/getUserAccountByEmail.service.js';

type GoogleTokenResponse = {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    id_token: string;
    refresh_token: string;
}

type GoogleAccountResponse = {
    sub: string;
    name: string;
    given_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
}

export const googleLogin = async (req: Request, res: Response) => {
    const { code } = req.query;
    let googleAccount: GoogleAccountResponse = {
        sub: "",
        name: "",
        given_name: "",
        picture: "",
        email: "",
        email_verified: false
    };

    if (typeof code !== "string") {
        throw new AdvancedError({ code: 400, message: "Invalid authorization code" });
    }

    try {
        // Fetch token
        const token: GoogleTokenResponse = await wc.callAPI(
            "https://oauth2.googleapis.com/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: new URLSearchParams({
                    client_id: getEnv("INTEGRATION_GOOGLE_AUTH_CLIENT"),
                    client_secret: getEnv("INTEGRATION_GOOGLE_AUTH_SECRET"),
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: config.isProduction
                        ? "https://auth.openprofile.app/login/google"
                        : "https://auth.dev.openprofile.app/login/google"
                }).toString()
            }
        );

        // Fetch external account
        googleAccount = await wc.callAPI(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { auth: `Bearer ${token.access_token}` }
        )

        // Fetch account
        const account = getUserAccountByExternalId("google", googleAccount.sub);

        return res.status(200).json({
            // SET COOKIES INSTEAD OF SENDING DATA AND RETURN TO HOME PAGE BASED ON THE REDIRECT
            account
        });

    } catch (error) {
        if (error instanceof AdvancedError) {
            // Email fallback if Google connection id is invalid
            if (googleAccount.email_verified && error.code === 404) {
                try {
                    const account = getUserAccountByEmail(googleAccount.email);

                    return res.redirect(`https://${config.domains.main}/account/onboarding`);
                    // SET COOKIES INSTEAD OF SENDING DATA AND RETURN TO HOME PAGE BASED ON THE REDIRECT
                    // account
                } catch (fallbackError) {
                    if (fallbackError instanceof AdvancedError) {

                        // IF DELETED, RESTORE ACCOUNT AFTER CLIENT PROMPT, ELSE REGISTER A NEW ONE

                        // Login or register account

                        // if no account: const account = registerUserAccountByExternalId("google", { displayName: googleAccount.name });
                        // ^ calls getUserAccountByExternalId inside of it after register

                        // CALL logAudit() or smth on connection

                        // SET COOKIES INSTEAD OF AND RETURN TO ACCOUNT/ONBORDING THEN BASED ON THE REDIRECT GO
                        // IF ONBOARDING COMPLETE, ON PAGE VISIT, GO TO account/settings. If not completed onboarding, force back there

                        log.db.error(fallbackError.stack).save();
                        return res.status(fallbackError.code).json(fallbackError.message);
                    } else {
                        console.log("Unknown error:", fallbackError);
                    }
                }
            }

            log.db.error(error.stack).save();
            return res.status(error.code).json(error.message);
        } else {
            console.log("Unknown error:", error);
        }
    }
};