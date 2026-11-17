import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { assertAccount } from "../../_common/asserts/account.assert.js";
import ModerationService from "../services/moderation.service.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";

export const moderateHistoryController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const cases = ModerationService.getCases(
            req.session.userId
        );

        const casesWithDecodedPermissions = cases.map((moderation) => ({
            ...moderation,
            revokedPermissionsArray: PlatformPermissionsService.decode(
                moderation.revokedPermissions as string
            )
        }));

        res.status(200).json(casesWithDecodedPermissions);
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
