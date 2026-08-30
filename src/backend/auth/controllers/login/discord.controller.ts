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
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

type ExternalAccountResponse = {
    id: string;
    username: string;
    avatar: string;
    banner: string;
    global_name: string;
    banner_color: string;
    email: string;
    verified: boolean;
}

export const discordLoginController = async (req: Request, res: Response) => {
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
            "https://discord.com/api/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: getEnv("INTEGRATION_DISCORD_CLIENT_ID") as string,
                    client_secret: getEnv("INTEGRATION_DISCORD_CLIENT_SECRET") as string,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: `https://${config.domains.auth}/login/discord`
                }).toString()
            }
        );

        const externalResponse: ExternalAccountResponse = await wc.callAPI(
            "https://discord.com/api/users/@me",
            { auth: `Bearer ${externalToken.access_token}` }
        )

        const response = await loginOrRegisterAccountService({
            session: req.session,
            delegationToken: req.cookies?.delegationToken,
            email: externalResponse.email,
            isEmailVerified: externalResponse.verified,
            username: externalResponse.username.toLowerCase(),
            displayName: externalResponse.global_name,
            avatar: `https://cdn.discordapp.com/avatars/${externalResponse.id}/${externalResponse.avatar}.png?size=512`,
            banner: `https://cdn.discordapp.com/banners/${externalResponse.id}/${externalResponse.banner}.png?size=1024`,
            // DEVELOPER NEEDED: Pass the theme from client storage localStorage.getItem("theme") ?? "dark"
            auraColor: externalResponse.banner_color,
            externalConnectionName: "DISCORD",
            externalConnectionId: externalResponse.id,
            externalConnectionText: externalResponse.username
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
