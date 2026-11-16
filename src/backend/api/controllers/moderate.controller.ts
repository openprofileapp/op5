import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { assertAccount } from "../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../_common/asserts/platformPermissions.assert.js";
import ModerationService from "../services/moderation.service.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";

export const moderateController = async (req: Request, res: Response) => {
    try {
        const { targetId, moderatorId, reason, note } = req.body;

        let moderator;

        if (moderatorId) {
            await assertApiSecret(req);

            moderator = moderatorId;
        } else {
            await assertBearer(req);
            assertAccount(req.session);
            assertPlatformPermissions(req.session, ["MODERATE_ACCOUNTS", "MANAGE_VISIBILITY"]);

            moderator = req.session.userId;
        }

        assertNotNull([targetId, reason]);

        const validReasons = [
            "ABUSIVE_BEHAVIOR", "SPAM_CONTENT", "MALICIOUS_CONTENT", 
            "EXPLICIT_CONTENT", "MISSING_MATURE_WARNING", "MISSING_SENSITIVE_WARNING", 
            "DMCA_TAKEDOWN", "PLATFORM_MISUSE", "PLATFORM_MANIPULATION",
            "BAN_EVASION", "PRIVACY_VIOLATION", "IMPERSONATION", "AI_GENERATED_CONTENT",
            "FILTER_BYPASS", "ILLEGAL_CONTENT", "CHARGEBACK"
        ]

        if (!validReasons.includes(reason)) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        await ModerationService.createCase(
            targetId,
            moderator,
            reason,
            note
        );

        res.status(200).json({
            ok: true
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
