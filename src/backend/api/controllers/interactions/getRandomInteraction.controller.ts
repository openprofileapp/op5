import type { Request, Response } from "express";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import getInteractionsService from "../../services/getInteractionsService.service.js";
import { InteractionNameType } from "../../../../_common/types/interaction.type.js";
import getPublishedCharactersService from "../../services/getPublishedCharacters.service.js";
import { AdvancedError } from "kage-library";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";

export const getRandomInteractionController = async (req: Request, res: Response) => {
    try {
        const { type, count } = 
            req.params as unknown as { type: InteractionNameType; count: string };

        await assertBearer(req); 
        assertAccount(req.session);
        assertNotNull([type, count]);

        const interactions = getInteractionsService({
            source: req.session.userId,
            type,
            getRandom: Number(count)
        })

        const character = getPublishedCharactersService({
            id: interactions[type]?.randomItem.target
        })

        res.status(200).json({
            items: character.items,
            count: character.count
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
