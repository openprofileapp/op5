import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { i18n } from "../../../_common/instances.js";
import getBotAccountService from "../../services/getBotAccount.service.js";
import { log } from "../../instances.js";

export const botLoginController = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.authorizationHeader")
            })
        }

        const authToken = authHeader.split(" ")[1];
        const response = getBotAccountService(authToken);

        return res.status(200).json(response);
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
