import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { discordMessage, log } from "../../../instances.js";
import { i18n } from "../../../../_common/instances.js";
import { assertApiSecret } from "../../../../_common/asserts/apiSecret.assert.js";
import { config } from "../../../../../../app.config.js";

export const createdDisputeController = async (req: Request, res: Response) => {
    try {
        assertApiSecret(req);

        const channels = config.integrations.discord.channels

        await discordMessage.send(
            config.isProduction ? channels.logs : channels.commandsDev,
            {
                embeds: [
                    {
                        author: {
                            name: "Someone created an external dispute."
                        },
                        color: 0xce1616,
                        description: `-# View the PayPal website or mobile app for more details.`
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
