import type { Request, Response } from "express";
import getMfaMethods from "../services/getMfaMethods.service.js";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";

// DEVELOPER NEEDED: Complete this later on
export const getMfaMethodsController = async (req: Request, res: Response) => {
    try {
        // req.session.userId
        const userId = "0"

        const response = await getMfaMethods(userId);

        return res.status(200).json(
            {...response}
        );
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
