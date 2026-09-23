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

export const updateValue = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params;
        const { fieldId, value } = req.body;

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

        db.templates.transaction((q) => {
            const currentResult = q(
                `SELECT * FROM "values" WHERE templateId = ? AND fieldId = ?`,
                [templateId, fieldId]
            );

            assertDbSuccess(currentResult);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

            const getHistoryResult = db.templates.query<{
                rowid: number;
                authorId: string;
                date: string;
            }>(
                "SELECT * FROM history WHERE templateId = ? AND fieldId = ? ORDER BY date DESC LIMIT 1",
                [templateId, fieldId]
            );

            assertDbSuccess(getHistoryResult);

            const latestHistory = getHistoryResult.rows?.[0];
            const isSameAuthor = latestHistory?.authorId === req.session.userId;
            const isWithinFiveMinutes = latestHistory?.date >= fiveMinutesAgo;
            const shouldInsert = !latestHistory || !isSameAuthor || !isWithinFiveMinutes;

            if (shouldInsert && previousValue) {
                const insertResult = db.templates.query(
                    `INSERT INTO history (
                        templateId,
                        fieldId, 
                        authorId, 
                        content
                    ) VALUES (?, ?, ?, ?)`,
                    [templateId, fieldId, req.session.userId, previousValue]
                );

                assertDbSuccess(insertResult);
            }

            const cleanupResult = db.templates.query(
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
