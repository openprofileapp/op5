import type { Request, Response } from 'express';

import { AdvancedError, URL } from 'kage-library';

import { log, wc } from '../../server.js';
import getEnv from '../../../../_common/helpers/getEnv.js';
import { config } from '../../../../../app.config.js';
import getUserAccountByEmail from '../../services/getUserAccountByEmail.service.js';
import loginOrRegisterAccount from '../../services/loginOrRegisterAccount.service.js';
import validateSession from '../../services/validateSession.service.js';

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

    // REQUIRES A BEARER OR BOT BEARER; IF BOT, LOGIN TO BOT

    try {
        // Fetch token
        const token: GoogleTokenResponse = await wc.callAPI(
            "https://oauth2.googleapis.com/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
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
        // I NEED EXTERNAL ID AND GET BY EMAIL ALL HERE IN ONE SPACE (MAYBE)
        const currentSession = await validateSession(req, res);

        if (!currentSession.sessionId) {
            throw new AdvancedError({ code: 400, message: "Invalid session id" });
        }

        // SINCE FETCH/CALL HAPPENS INSIDE, MAYBE DO NOT CALL EMAIL GET ON ERROR

        // NOTE; ON CLIENT SIDE, const theme = localStorage.getItem("theme") ?? "dark";

        const sessionToken = loginOrRegisterAccount({
            sessionId: currentSession.sessionId,
            email: googleAccount.email,
            isEmailVerified: googleAccount.email_verified,
            locale: currentSession.locale,
            timezone: currentSession.timezone,
            username: googleAccount.email.replace("@gmail.com", ""),
            displayName: googleAccount.name,
            avatar: googleAccount.picture,
            // theme: theme
            externalConnectionName: "google",
            externalConnectionId: googleAccount.sub,
            externalConnectionText: googleAccount.email
        });

        const url = new URL(`https://${config.domains.main}`);

        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });

        return res.redirect(`https://${config.domains.main}`); // ?redirect=LINK OR /onboarding thing
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error("Unknown error:", error).save();
        }
    } 
};