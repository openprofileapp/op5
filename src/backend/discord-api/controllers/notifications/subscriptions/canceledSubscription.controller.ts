import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { discordMessage, log, wc } from "../../../instances.js";
import { i18n } from "../../../../_common/instances.js";
import { assertApiSecret } from "../../../../_common/asserts/apiSecret.assert.js";
import { config } from "../../../../../../app.config.js";
import { WhatIsType } from "../../../../../_common/types/whatIs.type.js";
import getEnv from "../../../../../_common/helpers/getEnv.js";

export const canceledSubscriptionController = async (req: Request, res: Response) => {
    try {
        const { userId, subscriptionId } = req.body;

        assertApiSecret(req);

        if (!userId || !subscriptionId) return;

        const whatIs = await wc.callAPI<WhatIsType>(
            `https://${config.domains.api}/v3/whatis/${userId}`,
            { auth: `ApiSecret ${getEnv("API_SECRET")}` }
        );

        if (!whatIs) return;

        const channels = config.integrations.discord.channels

        await discordMessage.send(
            config.isProduction ? channels.logs : channels.commandsDev,
            {
                embeds: [
                    {
                    author: {
                        name: `${whatIs.displayName || whatIs.primaryUsername || whatIs.id} canceled their premium subscription.`,
                        icon_url: `https://${config.domains.cdn}${whatIs.avatar ?? config.metadata.assets.noImage}`,
                        url: `https://${config.domains.main}/user/${whatIs.id}`
                    },
                    color: 0xce1616,
                    description: `-# View the [console](https://${config.domains.console}/billing/subscription/${subscriptionId}) for more details.`
                    }
                ]
            }
        );

        res.status(200).json({
            ok: true
        });
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
