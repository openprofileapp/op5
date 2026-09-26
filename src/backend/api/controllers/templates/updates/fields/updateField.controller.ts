import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../../../_common/asserts/platformPermissions.assert.js";
import { db } from "../../../../databases/db.js";
import { assertDbSuccess } from "../../../../../../_common/asserts/dbSuccess.assert.js";
import { i18n } from "../../../../../_common/instances.js";
import { log } from "../../../../instances.js";

export const updateFields = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params;
        const { originalFieldId, data } = req.body;

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

        if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const allowedFields = new Set([
            "fieldId",
            "flex",
            "label",
            "placeholder",
            "options",
            "guide",
            "isLocked"
        ]);

        const updates: string[] = [];
        const values: unknown[] = [];

        // eslint-disable-next-line prefer-const
        for (let [key, value] of Object.entries(data)) {
            if (!allowedFields.has(key) || value === undefined) {
                continue;
            }

            if (key === "fieldId") {
                if (typeof value !== "string" || !/^[a-z-]+$/.test(value)) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidFieldId")
                    });
                }

                if (originalFieldId !== value) {
                    const getFieldIdResult = db.templates.query(
                        "SELECT * FROM fields WHERE fieldId = ?",
                        [value]
                    );

                    assertDbSuccess(getFieldIdResult);

                    if (getFieldIdResult.rowCount !== 0) {
                        throw new AdvancedError({
                            code: 404,
                            message: `A field with ID "${value}" already exists`
                        });
                    }

                    const updateValueResult = db.templates.query(
                        `UPDATE "values" SET fieldId = ? WHERE fieldId = ?`,
                        [value, originalFieldId]
                    );

                    assertDbSuccess(updateValueResult);

                    const updateValueHistoryResult = db.templates.query(
                        "UPDATE history SET fieldId = ? WHERE fieldId = ?",
                        [value, originalFieldId]
                    );

                    assertDbSuccess(updateValueHistoryResult);
                }
            }

            if (["isLocked"].includes(key)) {
                if (typeof value !== "boolean" && typeof value !== "number") {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.malformedRequest")
                    });
                }

                if (typeof value === "number") {
                    if (value !== 0 && value !== 1) {
                        throw new AdvancedError({
                            code: 400,
                            message: i18n.t("responses.malformedRequest")
                        });
                    }

                    value = Boolean(value);
                }
            }

            updates.push(`${key} = ?`);
            values.push(
                typeof value === "boolean"
                    ? (value ? 1 : 0)
                    : value
            );
        }

        if (updates.length === 0) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        updates.push("updatedDate = ?");
        values.push(new Date().toISOString());

        values.push(templateId);
        values.push(originalFieldId);

        const result = db.templates.query(
            `UPDATE fields SET ${updates.join(", ")} WHERE templateId = ? AND fieldId = ?`,
            values
        );

        assertDbSuccess(result);

        return res.status(200).json({
            ok: true,
        });

    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();

            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        }

        log.unknown.error(error).save();

        return res.status(500).json({
            message: i18n.t("responses.unknown"),
        });
    }
};
