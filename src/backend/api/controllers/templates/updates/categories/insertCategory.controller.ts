import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { log } from "../../../../instances.js";
import { assertBearer } from "../../../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../../../_common/instances.js";
import { db } from "../../../../databases/db.js";
import { assertDbSuccess } from "../../../../../../_common/asserts/dbSuccess.assert.js";

export const insertCategories = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params;
        const { categoryId, label, types, position } = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "WRITE");

        const getResult = db.templates.query(
            "SELECT * FROM templates WHERE id = ?",
            [templateId]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.templateNotFound")
            });
        }

        if (getResult.rows[0].ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        if (!categoryId || typeof categoryId !== "string") {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const countResult = db.templates.query<{ count: number }>(
            "SELECT COUNT(*) as count FROM categories WHERE templateId = ?",
            [templateId]
        );

        assertDbSuccess(countResult);

        const currentCount = countResult.rows?.[0]?.count ?? countResult.rowCount ?? 0;

        const targetPosition = typeof position === "number" ? position : currentCount;

        const insertResult = db.templates.query(
            `INSERT INTO categories (
                templateId, 
                categoryId, 
                label, 
                types, 
                position, 
                createdBy
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                templateId,
                categoryId,
                label ?? "Untitled",
                JSON.stringify(types ?? []),
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
