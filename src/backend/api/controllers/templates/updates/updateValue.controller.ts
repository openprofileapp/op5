/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";
import { DateTime } from "luxon";

import { assertBearer } from "../../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../../_common/asserts/platformPermissions.assert.js";
import { db } from "../../../databases/db.js";
import { assertDbSuccess } from "../../../../../_common/asserts/dbSuccess.assert.js";
import { i18n } from "../../../../_common/instances.js";
import { log } from "../../../instances.js";
import { FieldNameType } from "../../../../../_common/types/field.type.js";
import uploadFile from "../../../../_common/helpers/uploadFile.js";
import { ValueOptionsType } from "../../../../../_common/types/value.type.js";

export const updateValue = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params;

        const { fieldId, type, options } = req.body as {
            fieldId: string;
            type: FieldNameType;
            options?: ValueOptionsType;
        };

        let { value } = req.body as {
            value: string | number;
        };

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

        if (!fieldId) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const now = DateTime.now().toUTC().toString();
        const fiveMinutesAgo = DateTime.now().toUTC().minus({ minutes: 5 }).toString();

        if (type === "media") {
            const stringValue = typeof value === "string" ? value : "";
            const isBase64 = stringValue.startsWith("data:");

            if (isBase64) {
                const uploadedMedia = await uploadFile({
                    folder: `media/${templateId}`,
                    fileInput: stringValue
                });

                value = uploadedMedia?.path as string;
            }

            db.media.transaction((q) => {
                if (!value) {
                    const deleteMediaResult = q(
                        "DELETE FROM draft_content WHERE assetId = ? AND fieldId = ? LIMIT 1",
                        [templateId, fieldId]
                    );

                    assertDbSuccess(deleteMediaResult);
                    return;
                }

                const currentMediaResult = q(
                    "SELECT * FROM draft_content WHERE assetId = ? AND fieldId = ?",
                    [templateId, fieldId]
                );

                assertDbSuccess(currentMediaResult);

                // @ts-ignore
                const previousMedia = currentMediaResult.rows?.[0];

                const upsertMediaResult = q(
                    `INSERT INTO draft_content (
                        assetId,
                        fieldId,
                        url, 
                        description, 
                        credit, 
                        addedBy,
                        date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (assetId, fieldId) DO UPDATE SET
                        url = EXCLUDED.url,
                        description = EXCLUDED.description,
                        credit = EXCLUDED.credit,
                        addedBy = EXCLUDED.addedBy,
                        date = EXCLUDED.date`,
                    [
                        templateId,
                        fieldId,
                        value,
                        options?.description || "",
                        options?.credit || "",
                        req.session.userId,
                        now
                    ]
                );

                assertDbSuccess(upsertMediaResult);

                const getMediaHistoryResult = q(
                    "SELECT * FROM history_content WHERE assetId = ? AND fieldId = ? ORDER BY date DESC LIMIT 1",
                    [templateId, fieldId]
                );

                assertDbSuccess(getMediaHistoryResult);

                const latestMediaHistory = getMediaHistoryResult.rows?.[0];
                // @ts-ignore
                const isSameAuthor = latestMediaHistory?.addedBy === req.session.userId;
                // @ts-ignore
                const isWithinFiveMinutes = latestMediaHistory?.date >= fiveMinutesAgo;
                const shouldInsert = !latestMediaHistory || !isSameAuthor || !isWithinFiveMinutes;

                if (shouldInsert && previousMedia) {
                    const insertMediaHistoryResult = q(
                        `INSERT INTO history_content (
                            assetId,
                            fieldId, 
                            addedBy, 
                            url,
                            description,
                            credit,
                            date
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            templateId, 
                            fieldId, 
                            req.session.userId,
                            // @ts-ignore
                            previousMedia.url,
                            // @ts-ignore
                            previousMedia.description,
                            // @ts-ignore
                            previousMedia.credit,
                            now
                        ]
                    );

                    assertDbSuccess(insertMediaHistoryResult);
                }

                const cleanupMediaResult = q(
                    `DELETE FROM history_content 
                    WHERE assetId = ? AND fieldId = ?
                    AND date < (
                        SELECT date FROM history_content 
                        WHERE assetId = ? AND fieldId = ?
                        ORDER BY date DESC 
                        LIMIT 1 OFFSET 9
                    )`,
                    [templateId, fieldId, templateId, fieldId]
                );

                assertDbSuccess(cleanupMediaResult);
            });

            return res.status(201).json({ ok: true });
        }

        db.templates.transaction((q) => {
            if (!value) {
                const deleteValueResult = q(
                    `DELETE FROM "values" WHERE templateId = ? AND fieldId = ? LIMIT 1`,
                    [templateId, fieldId]
                );

                assertDbSuccess(deleteValueResult);
                return;
            }

            const currentResult = q(
                `SELECT * FROM "values" WHERE templateId = ? AND fieldId = ?`,
                [templateId, fieldId]
            );

            assertDbSuccess(currentResult);

            // @ts-ignore
            const previousValue = currentResult.rows?.[0]?.content;

            const postResult = q(
                `INSERT INTO "values" (
                    templateId,
                    fieldId, 
                    authorId, 
                    content, 
                    date
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (templateId, fieldId) DO UPDATE SET
                    authorId = EXCLUDED.authorId,
                    content = EXCLUDED.content,
                    date = EXCLUDED.date`,
                [
                    templateId,
                    fieldId,
                    req.session.userId,
                    value,
                    now
                ]
            );

            assertDbSuccess(postResult);

            const getHistoryResult = q(
                "SELECT * FROM history WHERE templateId = ? AND fieldId = ? ORDER BY date DESC LIMIT 1",
                [templateId, fieldId]
            );

            assertDbSuccess(getHistoryResult);

            const latestHistory = getHistoryResult.rows?.[0];
            // @ts-ignore
            const isSameAuthor = latestHistory?.authorId === req.session.userId;
            // @ts-ignore
            const isWithinFiveMinutes = latestHistory?.date >= fiveMinutesAgo;
            const shouldInsert = !latestHistory || !isSameAuthor || !isWithinFiveMinutes;

            if (shouldInsert && previousValue) {
                const insertResult = q(
                    `INSERT INTO history (
                        templateId,
                        fieldId, 
                        authorId, 
                        content,
                        date
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [templateId, fieldId, req.session.userId, previousValue, now]
                );

                assertDbSuccess(insertResult);
            }

            const cleanupResult = q(
                `DELETE FROM history 
                WHERE templateId = ? AND fieldId = ?
                AND date < (
                    SELECT date FROM history 
                    WHERE templateId = ? AND fieldId = ?
                    ORDER BY date DESC 
                    LIMIT 1 OFFSET 9
                )`,
                [templateId, fieldId, templateId, fieldId]
            );

            assertDbSuccess(cleanupResult);
        });

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
