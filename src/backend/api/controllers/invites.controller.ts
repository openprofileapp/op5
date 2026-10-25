import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../_common/asserts/platformPermissions.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import getInviteService from "../services/getInvite.service.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { config } from "../../../../app.config.js";

export const getInvitesController = async (req: Request, res: Response) => {
    try {
        const { 
            code,
            ownerId,
        } = req.params as unknown as { code: string, ownerId: string };

        const { 
            page, 
            includeUsers,
        } = req.query as unknown as { page: string, includeUsers: string };

        await assertBearer(req);
        assertPlatformPermissions(req.session, "VIEW");

        const offset = 
            (Number(page) || 1) * 
            Number(config.limits.assetsPerPage) - 
            Number(config.limits.assetsPerPage);

        if (!code && !ownerId) {
            assertNotNull([code, ownerId]);
        }

        const invite = getInviteService({
            code,
            owner: ownerId,
            getAs: req.session?.userId,
            includeUsers: Boolean(includeUsers),
            offset
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
