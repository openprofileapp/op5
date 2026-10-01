import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../_common/instances.js";
import { log } from "../../instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { DatasetItemType } from "../../../../_common/types/template/dataset.type.js";

export const publishDatasetController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        const getResult = db.templates.query<DatasetItemType>(
            "SELECT * FROM draft_datasets WHERE id = ? LIMIT 1",
            [id]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.datasetNotFound")
            });
        }

        const data = getResult.rows[0];

        if (data.ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        const insertResult = db.templates.query(
            `INSERT INTO published_datasets (
                id,
                ownerId, 
                label, 
                description,
                tags,
                data,
                source,
                uses,
                updatedDate,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                ownerId = excluded.ownerId,
                label = excluded.label,
                description = excluded.description,
                tags = excluded.tags,
                data = excluded.data,
                source = excluded.source,
                uses = excluded.uses,
                updatedDate = excluded.updatedDate`,
            [
                data.id,
                data.ownerId,
                data.label,
                data.description,
                data.tags,
                data.data,
                data.source,
                data.uses,
                Date.now().toString(),
                data.createdDate
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
