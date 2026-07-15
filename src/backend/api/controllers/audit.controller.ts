import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import isBearerTokenAuthorized from "../../_common/helpers/isBearerTokenAuthorized.js";
import createAuditLog from "../services/createAuditLog.service.js";
import { log } from "../instances.js";

export const createAuditLogController = async (req: Request, res: Response) => {
    try {
        if (!await isBearerTokenAuthorized(req.headers.authorization)) {
            
            // CREATE ACCESS AUDIT REPORTS ON FALSE AUTHORIZED; ALL APIS

            return res.status(401).json({ error: "Unauthorized" });
        }

        createAuditLog(req.body);

        return res.status(200).json({ ok: true });
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
        }
    }
};