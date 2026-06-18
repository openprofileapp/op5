import type { Request, Response } from "express";

import { AdvancedError, URL } from "kage-library";

import { log } from "../../instances.js";
import { wc } from "../../../_common/instances.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { config } from "../../../../../app.config.js";
import loginOrRegisterAccount from "../../services/loginOrRegisterAccount.service.js";
import validateSession from "../../services/validateSession.service.js";

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
        // Fetch external token and external account
        const externalToken: GoogleTokenResponse = await wc.callAPI(
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

        googleAccount = await wc.callAPI(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { auth: `Bearer ${externalToken.access_token}` }
        )

        // Fetch session and internal account
        const currentSession = await validateSession(req, res);

        if (!currentSession.sessionId) {
            throw new AdvancedError({ code: 400, message: "Invalid session" });
        }

        const internalToken = loginOrRegisterAccount({
            sessionId: currentSession.sessionId,
            email: googleAccount.email,
            isEmailVerified: googleAccount.email_verified,
            locale: currentSession.locale,
            timezone: currentSession.timezone,
            username: googleAccount.email.replace("@gmail.com", ""),
            displayName: googleAccount.name,
            avatar: googleAccount.picture,
            // theme: CLIENT SIDE CODE `const theme = localStorage.getItem("theme") ?? "dark";`
            externalConnectionName: "google",
            externalConnectionId: googleAccount.sub,
            externalConnectionText: googleAccount.email
        });

        const url = new URL(`https://${config.domains.main}`);

        if (internalToken.type === "mfa") {
            res.cookie("mfaToken", internalToken.value, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${url.domain}`,
                path: "/",
                maxAge: 1000 * 60 * 15 // 15 minutes
            });

            return res.status(200).json({
                action: "DISPLAY_MFA"
            });
        } else {
            // ALSO ADD AUDIT LOGGING FOR A SUCESSFUL LOGIN

            res.cookie("sessionToken", internalToken.value, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${url.domain}`,
                path: "/",
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            });

            // RETURN HERE
        }

        if (internalToken.type === "mfa") {
            return res.redirect(
                `https://${config.domains.main}/mfa`
            );
        } else {
            // CREATE BACKUP CODES SQL AND TYPE
            // getBackupCodesByUserId();
            // MARK AS USED ON USE, DO NOT DELETE UNLESS USER REGENERATED THEM

            // validateSesson(req, res, true);

            // ON SUCCESS CALL mfa/verify; IF VALID, UPDATE THE MFA CHALLENGE DATA TO SESSION DATA/SETTING COOKIES
            // CHECK IF EXPIRED AND IF SO REQUEST NEW LOGIN // BACKUP CODES ALWAYS PASSES body { code, backupCode }
            // ON MFA SUBMIT, CALL VALIDATE SESSION JUST TO VERIFY ALL IS GOOD
            // ON EVERY CALL, IT INCREASES THE ATTEMPTS AND BLOCKES YOU AFTER 5 BY KILLING THE SESSION AND MFA AND LOGGING AUDIT
            // CREATE getSessionBySessionId(); WHICH RETURNS THE SESSION FULL; USEFUL FOR AUDIT LOGGING

            return res.redirect(
                `https://${config.domains.main}` // ?redirect=LINK OR /onboarding thing
            );
        }
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