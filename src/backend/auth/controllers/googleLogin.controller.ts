import type { Request, Response } from 'express';

import { AdvancedError } from 'kage-library';

import { log, wc } from '../server.js';
import getEnv from '../../../_common/helpers/getEnv.js';
import { config } from '../../../../app.config.js';

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
        const googleAccount: GoogleAccountResponse = await wc.callAPI(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { auth: `Bearer ${token.access_token}` }
        )

        // Login or register account


        // const account = getUserAccountByExternalId("google", googleAccount.sub);
        // if no account: const account = registerUserAccountByExternalId("google", googleAccount);
        // ^ calls getUserAccountByExternalId inside of it after register

        return res.status(200).json({
            googleAccount
        });

    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error.stack).save();
            return res.status(error.code).json(error.message);
        } else {
            console.log("Unknown error:", error);
        }
    }
};