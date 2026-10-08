import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { discordMessage, log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";
import { config } from "../../../../app.config.js";

export const newAccountController = async (req: Request, res: Response) => {
    try {
        const { 
            userId,
            username,
            displayName
        } = req.body;

        if (!userId) return;

        assertApiSecret(req);

        const channels = config.integrations.discord.channels

        await discordMessage.send(
            config.isProduction ? channels.logs : channels.commandsDev,  
            {
                flags: 32768,
                components: [
                    {
                        type: 17,
                        accent_color: 1286414,
                        spoiler: false,
                        components: [
                            {
                                type: 10,
                                content: `[**${displayName || username || userId}**](https://${config.domains.main}/user/${userId}) registered an account.`
                            },
                            {
                                type: 14,
                                spacing: 1
                            },
                            {
                                type: 10,
                                content: `-# View the [console](https://${config.domains.console}/user/${userId}) for more details.`
                            }
                        ]
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
