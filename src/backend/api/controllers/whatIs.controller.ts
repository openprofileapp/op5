import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import whatIs from "../services/whatIs.service.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";

export const whatIsController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("ApiSecret ")) {
            await assertApiSecret(req);
            assertNotNull(id);

            const whatIsData = whatIs(
                id as string,
                true
            );

            res.status(200).json({
                ...whatIsData
            });
        }

        await assertBearer(req);
        assertNotNull(id);

        const whatIsData = whatIs(
            id as string,
            false,
            req.session.userId || req.ip
        );

        res.status(200).json({
            ...whatIsData
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
