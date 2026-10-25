import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { log, snowflake } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertAccount } from "../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../_common/asserts/platformPermissions.assert.js";

export const contentReportController = async (req: Request, res: Response) => {
    try {
        const { 
            contentId, 
            type, 
            description 
        } = req.body;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_REPORTS");

        assertNotNull([contentId, type]);

        if (!description) {
            throw new AdvancedError({
                code: 400,
                message: "A description is required"
            });
        }

        const getResult = db.reports.query(
            `SELECT 1 FROM content
            WHERE source = ? AND target = ? AND status = 'pending'`,
            [req.session.userId, contentId]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount !== 0) {
            throw new AdvancedError({
                code: 400,
                message: "You already reported this"
            });
        }

        const validTypes = [
            "abuse", "spam", "inappropriate", 
            "dmca", "misuse", "safety", 
            "impersonation", "ai", "other"
        ]

        if (!validTypes.includes(type)) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const insertResult = db.reports.query(
            `INSERT INTO content (
                id,
                source,
                target,
                type,
                description
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                snowflake.gen(),
                req.session.userId,
                contentId,
                type,
                description
            ]
        );

        assertDbSuccess(insertResult);

        // DEVELOPER NEEDED: Remove the algorithm score

        // DEVELOPER NEEDED: Send notification to user

        // DEVELOPER NEEDED: Send discord alert to staff

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
