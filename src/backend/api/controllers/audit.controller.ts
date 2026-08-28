import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import createAuditLogService from "../services/createAuditLog.service.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";

export const createAuditLogController = async (req: Request, res: Response) => {
    try {
        const { type, action, source, target, changes, origin } = req.body;

        await assertBearer(req);

        createAuditLogService(
            type,
            action,
            source,
            {
                target,
                changes,
                origin
            }
        );

        return res.status(200).json({ ok: true });
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
