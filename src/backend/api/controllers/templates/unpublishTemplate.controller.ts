import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../_common/instances.js";
import { log } from "../../instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { TemplateType } from "../../../../_common/types/template/template.type.js";

export const unpublishTemplateController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        const getResult = db.templates.query<TemplateType>(
            "SELECT * FROM drafts WHERE id = ? LIMIT 1",
            [id]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.templateNotFound")
            });
        }

        const data = getResult.rows[0];

        if (data.ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        const deleteResult = db.templates.query(
            "DELETE FROM published WHERE id = ? LIMIT 1",
            [id]
        );

        assertDbSuccess(deleteResult);

        const deleteCategoriesResult = db.templates.query(
            "DELETE FROM published_categories WHERE templateId = ?",
            [id]
        );

        assertDbSuccess(deleteCategoriesResult);

        const deleteBlocksResult = db.templates.query(
            "DELETE FROM published_blocks WHERE templateId = ?",
            [id]
        );

        assertDbSuccess(deleteBlocksResult);

        const deleteRowsResult = db.templates.query(
            "DELETE FROM published_rows WHERE templateId = ?",
            [id]
        );

        assertDbSuccess(deleteRowsResult);

        const deleteFieldsResult = db.templates.query(
            "DELETE FROM published_fields WHERE templateId = ?",
            [id]
        );

        assertDbSuccess(deleteFieldsResult);

        const deleteValuesResult = db.templates.query(
            "DELETE FROM published_values WHERE templateId = ?",
            [id]
        );

        assertDbSuccess(deleteValuesResult);

        const deleteMediaResult = db.media.query(
            "DELETE FROM published_content WHERE assetId = ?",
            [id]
        );

        assertDbSuccess(deleteMediaResult);

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
