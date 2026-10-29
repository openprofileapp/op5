import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import getInviteService from "../services/getInvite.service.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";

export const getPrivateInvitesController = async (req: Request, res: Response) => {
    try {
        const { 
            code,
            ownerId,
        } = req.params as unknown as { code: string, ownerId: string };

        await assertBearer(req);
        await assertApiSecret(req);

        // WARNING: Do NOT validate session here. It will cause a recursion with auth server.

        if (!code && !ownerId) {
            assertNotNull([code, ownerId]);
        }

        const invite = await getInviteService({
            code,
            owner: ownerId
        })

        res.status(200).json(invite);
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
