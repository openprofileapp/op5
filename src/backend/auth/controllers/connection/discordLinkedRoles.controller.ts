import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { i18n, wc } from "../../../_common/instances.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { ConnectionType } from "../../types/connection.type.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { config } from "../../../../../app.config.js";
import { WhatIsType } from "../../../../_common/types/whatIs.type.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";

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
}

export const discordLinkedRolesController = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;

        await assertBearer(req);
        assertAccount(req.session);

        const redirectUri = `https://${config.domains.auth}/integration/discord`;

        if (!code) {
            const oauthUrl =
                `https://discord.com/api/oauth2/authorize?client_id=${getEnv("INTEGRATION_DISCORD_CLIENT_ID")}` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                `&response_type=code&scope=identify role_connections.write`;

            return res.redirect(oauthUrl);
        }

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
                    redirect_uri: redirectUri
                }).toString()
            }
        );

        const externalResponse: ExternalAccountResponse = await wc.callAPI(
            "https://discord.com/api/users/@me",
            { auth: `Bearer ${externalToken.access_token}` }
        )

        const result = db.accounts.query<ConnectionType>(
            `
                SELECT *
                FROM connections
                WHERE userId = ?
                AND connectionId = ?
                AND connectionName = 'DISCORD'
                LIMIT 1
            `,
            [req.session.userId, externalResponse.id]
        );
        
        assertDbSuccess(result);

        if (result.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: "Your Discord account is not connected to your OpenProfile account."
            });
        }

        const metadata = await wc.callAPI(
            `https://${config.domains.api}/v3/integrations/metadata/${req.session.userId}`,
            { auth: `ApiSecret ${getEnv("API_SECRET")}` }
        );

        const whoIs = await wc.callAPI<WhatIsType>(
            `https://${config.domains.api}/v3/whatis/${req.session.userId}`,
            { auth: `ApiSecret ${getEnv("API_SECRET")}` }
        );

        const pushResponse = await fetch(
            `https://discord.com/api/v10/users/@me/applications/${getEnv("INTEGRATION_DISCORD_CLIENT_ID")}/role-connection`, 
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${externalToken.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    platform_name: "OpenProfile",
                    platform_username: `${whoIs.primaryUsername || req.session.userId}`,
                    metadata
                })
            }
        );

        if (!pushResponse.ok) {
            const text = await pushResponse.text();

            throw new AdvancedError({
                code: 500,
                message: text
            });
        }

        res.status(200).send("Roles updated. You can close this page and return to Discord.");
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
