import type { Request, Response } from "express";

import { AdvancedError, URL } from "kage-library";

import { i18n, wc } from "../../../_common/instances.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { config } from "../../../../../app.config.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import loginOrRegisterAccountService from "../../services/loginOrRegisterAccount.service.js";
import { log } from "../../instances.js";

type ExternalAccountResponse = {
    login: string;
    id: number;
    avatar_url: string;
    name: string;
    blog: string;
    location: string;
    bio: string;
}

type ExternalEmailResponse = {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string;
}

export const githubLoginController = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;

        assertNotNull(req.session.sessionId);

        if (typeof code !== "string") {
            throw new AdvancedError({ 
                code: 400, 
                message: i18n.t("responses.invalidAuthorizationCode")
            });
        }

        const externalToken: string = await wc.callAPI(
            "https://github.com/login/oauth/access_token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: getEnv("INTEGRATION_GITHUB_AUTH_CLIENT") as string,
                    client_secret: getEnv("INTEGRATION_GITHUB_AUTH_SECRET") as string,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: `https://${config.domains.auth}/login/github`
                }).toString()
            }
        );

        const params = new URLSearchParams(externalToken);
        const externalAccessToken = params.get("access_token");

        const externalUserResponse: ExternalAccountResponse = await wc.callAPI(
            "https://api.github.com/user",
            { auth: `Bearer ${externalAccessToken}` }
        )

        const externalEmailResponse: ExternalEmailResponse[] = await wc.callAPI(
            "https://api.github.com/user/emails",
            { auth: `Bearer ${externalAccessToken}` }
        )

        const response = await loginOrRegisterAccountService({
            session: req.session,
            delegationToken: req.cookies?.delegationToken,
            email: externalEmailResponse[0].email,
            isEmailVerified: externalEmailResponse[0].verified,
            username: externalUserResponse.login.toLowerCase(),
            displayName: externalUserResponse.name,
            avatar: externalUserResponse.avatar_url,
            // DEVELOPER NEEDED: Pass the theme from client storage localStorage.getItem("theme") ?? "dark"
            about: externalUserResponse.bio,
            externalConnectionName: "GITHUB",
            externalConnectionId: externalUserResponse.id.toString(),
            externalConnectionText: externalUserResponse.login
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
                    maxAge: 1000 * 60 * config.limits.accessTokenExpireInMinutes
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
                        maxAge: 1000 * 60 * config.limits.accessTokenExpireInMinutes
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
