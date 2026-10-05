import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../_common/instances.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { TemplateType } from "../../../../_common/types/template/template.type.js";

const TAG_REGEX = /^[a-z-]+$/;

export const updateTemplates = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params;
        const { data } = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        const currentresult = db.templates.query<TemplateType>(
            "SELECT * FROM drafts WHERE id = ? LIMIT 1",
            [templateId]
        );

        assertDbSuccess(currentresult);

        if (currentresult.rowCount < 1) {
            throw new AdvancedError({ 
                code: 404, 
                message: i18n.t("responses.templateNotFound")
            });
        }

        const currentTemplate = currentresult.rows?.[0];

        if (currentTemplate.ownerId !== req.session.userId) {
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
            "tags"
        ]);

        const updates: string[] = [];
        const values: unknown[] = [];

        // eslint-disable-next-line prefer-const
        for (let [key, value] of Object.entries(data)) {
            if (!allowedFields.has(key) || value === undefined) {
                continue;
            }

            if (key === "displayName") {
                if (typeof value !== "string" || value.length > 32) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidDisplayNameLength")
                    });
                }
            }

            if (key === "about") {
                if (typeof value !== "string" || value.length > 320) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidAboutLength")
                    });
                }
            }

            if (key === "tags") {
                let parsedTags: string[] = [];

                if (typeof value === "string") {
                    parsedTags = value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t.length > 0);
                } else if (Array.isArray(value)) {
                    parsedTags = value
                        .map((t) => (typeof t === "string" ? t.trim() : ""))
                        .filter((t) => t.length > 0);
                } else {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidTagsFormat")
                    });
                }

                const isValid =
                    parsedTags.length > 0 &&
                    parsedTags.every(
                        (t) => t.length >= 3 && t.length <= 24 && TAG_REGEX.test(t)
                    );

                if (!isValid) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidTagsFormat")
                    });
                }

                updates.push(`${key} = ?`);
                values.push(JSON.stringify(parsedTags));
                continue;
            }

            updates.push(`${key} = ?`);
            values.push(typeof value === "boolean" ? (value ? 1 : 0) : value);
        }

        if (updates.length === 0) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        if (updates.length > 0) {
            values.push(templateId);

            const result = db.templates.query(
                `UPDATE drafts SET ${updates.join(", ")} WHERE id = ?`,
                values
            );

            assertDbSuccess(result);
        }

        return res.status(200).json({
            ok: true,
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
