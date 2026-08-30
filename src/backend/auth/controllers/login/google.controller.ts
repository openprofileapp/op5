import type { Request, Response } from "express";

import { AdvancedError, URL } from "kage-library";

import { i18n, wc } from "../../../_common/instances.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { config } from "../../../../../app.config.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import loginOrRegisterAccountService from "../../services/loginOrRegisterAccount.service.js";
import { log } from "../../instances.js";

type ExternalTokenResponse = {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    id_token: string;
    refresh_token: string;
}

type ExternalAccountResponse = {
    sub: string;
    name: string;
    given_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
}

export const googleLoginController = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;

        assertNotNull(req.session.sessionId);

        if (typeof code !== "string") {
            throw new AdvancedError({ 
                code: 400, 
                message: i18n.t("responses.invalidAuthorizationCode")
            });
        }

        const externalToken: ExternalTokenResponse = await wc.callAPI(
            "https://oauth2.googleapis.com/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: getEnv("INTEGRATION_GOOGLE_AUTH_CLIENT") as string,
                    client_secret: getEnv("INTEGRATION_GOOGLE_AUTH_SECRET") as string,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: `https://${config.domains.auth}/login/google`
                }).toString()
            }
        );

        const externalResponse: ExternalAccountResponse = await wc.callAPI(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { auth: `Bearer ${externalToken.access_token}` }
        )

        const response = await loginOrRegisterAccountService({
            session: req.session,
            delegationToken: req.cookies?.delegationToken,
            email: externalResponse.email,
            isEmailVerified: externalResponse.email_verified,
            username: externalResponse.email.replace("@gmail.com", "").toLowerCase(),
            displayName: externalResponse.name,
            avatar: externalResponse.picture,
            // DEVELOPER NEEDED: Pass the theme from client storage localStorage.getItem("theme") ?? "dark"
            externalConnectionName: "GOOGLE",
            externalConnectionId: externalResponse.sub,
            externalConnectionText: externalResponse.email
        });

        const url = new URL(`https://${config.domains.main}`);

        if (response) {
            if (response.mfaToken) {
                res.cookie("mfaToken", response.mfaToken, {
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
                if (response.sessionId) {
                    res.cookie("sessionId", response.sessionId, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        domain: `.${url.domain}`,
                        path: "/",
                        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                    });
                }

                if (response.accessToken) {
                    res.cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        domain: `.${url.domain}`,
                        path: "/",
                        maxAge: 1000 * 60 * 5, // 5 minutes
                    });
                }

                if (response.sessionToken) {
                    res.cookie("sessionToken", response.sessionToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        domain: `.${url.domain}`,
                        path: "/",
                        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
                    });
                }

                if (response.delegationToken) {
                    res.cookie("delegationToken", response.delegationToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        domain: `.${url.domain}`,
                        path: "/",
                        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
                    });
                }

                return res.redirect(
                    // DEVELOPER NEEDED: hasCompletedOnboarding
                    `https://${config.domains.main}` // ?redirect=LINK OR /onboarding thing
                );
            }
        }
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
