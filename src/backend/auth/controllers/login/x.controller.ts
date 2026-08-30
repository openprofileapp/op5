import type { Request, Response } from "express";

import { AdvancedError, URL } from "kage-library";

import { i18n, wc } from "../../../_common/instances.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { config } from "../../../../../app.config.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import loginOrRegisterAccountService from "../../services/loginOrRegisterAccount.service.js";
import { log } from "../../instances.js";

type ExternalTokenResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
    scope: string;
}

type ExternalAccountResponse = {
    data: {
        confirmed_email: string;
        description: string;
        id: string;
        name: string;
        profile_image_url: string;
        profile_banner_url: string;
        username: string;
    };
};

export const xLoginController = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;
        const codeVerifier = req.cookies.x_oauth_verifier;

        assertNotNull(req.session.sessionId);

        if (typeof code !== "string") {
            throw new AdvancedError({ 
                code: 400, 
                message: i18n.t("responses.invalidAuthorizationCode")
            });
        }

        const externalToken: ExternalTokenResponse = await wc.callAPI(
            "https://api.x.com/2/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${Buffer.from(
                        `${getEnv("INTEGRATION_X_AUTH_CLIENT")}:${getEnv("INTEGRATION_X_AUTH_SECRET")}`
                    ).toString("base64")}`
                },
                body: new URLSearchParams({
                    client_id: getEnv("INTEGRATION_X_AUTH_CLIENT") as string,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: `https://${config.domains.auth}/login/x`,
                    code_verifier: codeVerifier
                }).toString()
            }
        );

        const externalResponse: ExternalAccountResponse = await wc.callAPI(
            "https://api.x.com/2/users/me?user.fields=confirmed_email,description,profile_image_url,profile_banner_url,verified",
            { auth: `Bearer ${externalToken.access_token}` }
        );

        const response = await loginOrRegisterAccountService({
            session: req.session,
            delegationToken: req.cookies?.delegationToken,
            email: externalResponse.data.confirmed_email,
            isEmailVerified: true,
            username: externalResponse.data.username.toLowerCase(),
            displayName: externalResponse.data.name,
            avatar: externalResponse.data.profile_image_url,
            banner: externalResponse.data.profile_banner_url,
            // DEVELOPER NEEDED: Pass the theme from client storage localStorage.getItem("theme") ?? "dark"
            about: externalResponse.data.description,
            externalConnectionName: "X",
            externalConnectionId: externalResponse.data.id,
            externalConnectionText: externalResponse.data.username
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
