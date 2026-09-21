import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { log } from "../../../../instances.js";
import { assertBearer } from "../../../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../../../_common/instances.js";
import { db } from "../../../../databases/db.js";
import { assertDbSuccess } from "../../../../../../_common/asserts/dbSuccess.assert.js";

export const deleteCategories = async (req: Request, res: Response) => {
    try {
        const { assetId, categoryId } = req.params;

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

        if (!categoryId) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        db.characters.query(
            "DELETE FROM draft_fields WHERE assetId = ? AND categoryId = ?",
            [assetId, categoryId]
        );

        db.characters.query(
            "DELETE FROM draft_rows WHERE assetId = ? AND categoryId = ?",
            [assetId, categoryId]
        );

        db.characters.query(
            "DELETE FROM draft_blocks WHERE assetId = ? AND categoryId = ?",
            [assetId, categoryId]
        );

        const deleteResult = db.characters.query(
            "DELETE FROM draft_categories WHERE assetId = ? AND categoryId = ?",
            [assetId, categoryId]
        );

        assertDbSuccess(deleteResult);

        return res.status(200).json({ ok: true });
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
