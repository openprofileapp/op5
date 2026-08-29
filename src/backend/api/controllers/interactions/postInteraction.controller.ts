import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { InteractionNameType } from "../../../../_common/types/interaction.type.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import postInteractionService from "../../services/postInteraction.service.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";

type Props = {
    targetId: string, 
    type: InteractionNameType
}

export const postInteractionController = async (req: Request, res: Response) => {
    try {
        const { targetId, type }: Props = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertNotNull([targetId, type]);

        await postInteractionService(
            req.session.userId,
            targetId, 
            type,
            req.session
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
