import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../../_common/asserts/platformPermissions.assert.js";
import { db } from "../../../databases/db.js";
import { assertDbSuccess } from "../../../../../_common/asserts/dbSuccess.assert.js";
import { i18n } from "../../../../_common/instances.js";
import { DatasetItemType } from "../../../../../_common/types/template/dataset.type.js";
import { log } from "../../../instances.js";

export const updateDatasetController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { label, description, data } = req.body;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "WRITE");

        const getResult = db.templates.query<DatasetItemType>(
            "SELECT * FROM datasets WHERE id = ?",
            [id]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.datasetNotFound")
            });
        }

        if (getResult.rows[0].ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        if (!label && !data && !description) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        let parsedData = data;

        if (typeof data === "string") {
            try {
                parsedData = JSON.parse(data);
            } catch {
                throw new AdvancedError({
                    code: 400,
                    message: i18n.t("responses.malformedRequest")
                });
            }
        }


        if (Array.isArray(parsedData)) {
            const seenIds = new Set<string | number>();

            for (const item of parsedData) {
                let obj = item;
                if (typeof item === "string") {
                    try {
                        obj = JSON.parse(item);
                    } catch {
                        // Skip
                    }
                }

                if (obj && typeof obj === "object" && "id" in obj) {
                    if (seenIds.has(obj.id)) {
                        throw new AdvancedError({
                            code: 400,
                            message: `${i18n.t("responses.duplicateId")} ${obj.id}`
                        });
                    }
                    seenIds.add(obj.id);
                }
            }
        }

        const postResult = db.templates.query(
            `
                UPDATE datasets
                SET
                    label = COALESCE(?, label),
                    description = COALESCE(?, description),
                    data = COALESCE(?, data),
                    updatedDate = ?
                WHERE id = ? AND ownerId = ?
            `,
            [
                label ?? null,
                description ?? null,
                JSON.stringify(data),
                new Date().toISOString(),
                id,
                req.session.userId,
            ]
        );

        assertDbSuccess(postResult);

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
