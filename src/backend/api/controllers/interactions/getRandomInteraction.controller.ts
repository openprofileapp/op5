import type { Request, Response } from "express";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import getInteractionsService from "../../services/getInteractions.service.js";
import { InteractionNameType } from "../../../../_common/types/interaction.type.js";
import { AdvancedError } from "kage-library";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";

export const getRandomInteractionController = async (req: Request, res: Response) => {
    try {
        const { type, count } = 
            req.params as unknown as { type: InteractionNameType; count: string };

        await assertBearer(req); 
        assertPlatformPermissions(req.session, "VIEW");
        assertNotNull([type, count]);

        const interactions = getInteractionsService({
            source: req.session.userId,
            type,
            getRandom: Number(count)
        })

        res.status(200).json(interactions[type]?.randomItem);
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
