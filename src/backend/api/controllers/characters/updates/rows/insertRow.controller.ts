import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { log } from "../../../../instances.js";
import { assertBearer } from "../../../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../../../_common/instances.js";
import { db } from "../../../../databases/db.js";
import { assertDbSuccess } from "../../../../../../_common/asserts/dbSuccess.assert.js";

export const insertRows = async (req: Request, res: Response) => {
    try {
        const { assetId } = req.params;
        const { rowId, blockId, position } = req.body;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "WRITE");

        const getResult = db.characters.query(
            "SELECT * FROM drafts WHERE id = ?",
            [assetId]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.characterNotFound")
            });
        }

        if (getResult.rows[0].ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        if (!rowId || !blockId || typeof rowId !== "string" || typeof blockId !== "string") {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const countResult = db.characters.query<{ count: number }>(
            "SELECT 1 FROM draft_rows WHERE blockId = ?",
            [blockId]
        );

        assertDbSuccess(countResult);

        const targetPosition = typeof position === "number" ? position : countResult.rowCount;

        const insertResult = db.characters.query(
            `INSERT INTO draft_rows (
                assetId,
                rowId, 
                blockId, 
                position, 
                createdBy
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                assetId,
                rowId,
                blockId,
                targetPosition,
                req.session.userId
            ]
        );

        assertDbSuccess(insertResult);

        return res.status(201).json({ ok: true });
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({ id: error.id, message: error.message });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({ message: i18n.t("responses.unknown") });
        }
    }
};
