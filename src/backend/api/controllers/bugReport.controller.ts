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

export const bugReportController = async (req: Request, res: Response) => {
    try {
        const { 
            type, 
            errorId, 
            description, 
            reproductionSteps, 
            expectedResults, 
            actualResults, 
            affectsStable, 
            affectsNightly 
        } = req.body;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_REPORTS");

        assertNotNull(type);

        if (!description) {
            throw new AdvancedError({
                code: 400,
                message: "A description is required"
            });
        }

        if (Boolean(!affectsStable) && Boolean(!affectsNightly)) {
            throw new AdvancedError({
                code: 400,
                message: "An affected selection is required"
            });
        }

        const validTypes = [
            "ui", "error", "functionality", 
            "localization", "performance", "crash", 
            "accessibility", "other"
        ]

        if (!validTypes.includes(type)) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const isClientError = 
            type === "ui"
            || type === "localization"
            || type === "performance"
            || type === "accessibility"
        ;

        if (
            !isClientError &&
            (
                !reproductionSteps
                || !expectedResults
                || !actualResults
            )
        ) {
            throw new AdvancedError({
                code: 400,
                message: "Fill all the fields"
            });
        }

        const userAgent = req.get("user-agent") ?? null;

        const insertResult = db.reports.query(
            `INSERT INTO bugs (
                id,
                source,
                type,
                errorId,
                description,
                reproductionSteps,
                expectedResults,
                actualResults,
                affectsStable,
                affectsNightly,
                userAgent
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                snowflake.gen(),
                req.session.userId,
                type,
                errorId,
                description,
                reproductionSteps,
                expectedResults,
                actualResults,
                affectsStable ? 1 : 0,
                affectsNightly ? 1 : 0,
                userAgent
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
