import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../_common/instances.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import uploadFile from "../../../_common/helpers/uploadFile.js";
import { log } from "../../instances.js";

export const updateBlocks = async (req: Request, res: Response) => {
    try {
        const { blockId } = req.params;
        const { categoryId, data } = req.body;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        if (!categoryId) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const getResult = db.blocks.query(
            "SELECT * FROM drafts WHERE id = ?",
            [blockId]
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
            "displayName",
            "about",
            "icon",
            "type",
            "tags"
        ]);

        let uploadedIcon;

        if (data.icon) {
            uploadedIcon = await uploadFile({
                folder: `media/${blockId}`,
                fileInput: data.icon
            });
        }

        const updates: string[] = [];
        const values: unknown[] = [];

        // eslint-disable-next-line prefer-const
        for (let [key, value] of Object.entries(data)) {
            if (!allowedFields.has(key) || value === undefined) {
                continue;
            }

            if (key === "icon") {
                value = uploadedIcon?.path;
            }

            if (key === "tags") {
                value = JSON.stringify(data.tags || [])
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

        values.push(blockId);

        const result = db.blocks.query(
            `UPDATE drafts SET ${updates.join(", ")} WHERE id = ?`,
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
