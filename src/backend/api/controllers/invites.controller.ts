import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../_common/asserts/platformPermissions.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import getInviteService from "../services/getInvite.service.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { config } from "../../../../app.config.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";

export const getInvitesController = async (req: Request, res: Response) => {
    try {
        const { 
            code,
            ownerId,
            userId
        } = req.params as unknown as { code: string, ownerId: string, userId: string };

        const { 
            page, 
            includeUsers
        } = req.query as unknown as { page: string, includeUsers: string };

        if (userId) {
            await assertApiSecret(req);

            const result = db.invites.query(
                `
                    SELECT
                        c.ownerId,
                        c.code
                    FROM uses u
                    INNER JOIN codes c ON c.code = u.code
                    WHERE u.userId = ?
                    ORDER BY u.date DESC
                    LIMIT 1
                `,
                [userId]
            );

            assertDbSuccess(result);

            return res.status(200).json(
                result.rows?.[0] ?? {}
            );
        }

        await assertBearer(req);
        assertPlatformPermissions(req.session, "VIEW");

        const offset = 
            (Number(page) || 1) * 
            Number(config.limits.assetsPerPage) - 
            Number(config.limits.assetsPerPage);

        if (!code && !ownerId) {
            assertNotNull([code, ownerId]);
        }

        const invite = await getInviteService({
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
