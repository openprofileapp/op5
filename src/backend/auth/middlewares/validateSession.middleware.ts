import type { Request, Response, NextFunction } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import validateSession from "../services/validateSession.service.js";
import { i18n } from "../../_common/instances.js";

export const validateSessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await validateSession(req, res);

        if ("action" in response && response.action === "REFRESH_PAGE") {
            return res.redirect(
                req.originalUrl || "/"
            );
        }

        if (!("action" in response)) {
            req.session = response;
        }

        next();
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
