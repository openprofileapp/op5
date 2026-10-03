import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../_common/instances.js";
import { log } from "../../instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { BlockItemType } from "../../../../_common/types/blocks/block.type.js";

export const publishBlockController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        const getResult = db.blocks.query<BlockItemType>(
            "SELECT * FROM drafts WHERE blockId = ? LIMIT 1",
            [id]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.blocksNotFound")
            });
        }

        const data = getResult.rows[0];

        if (data.ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        const insertResult = db.blocks.query(
            `INSERT INTO published (
                blockId,
                ownerId,
                categoryType,
                icon,
                displayName, 
                about,
                tags,
                source,
                updatedDate,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(blockId) DO UPDATE SET
                ownerId = excluded.ownerId,
                categoryType = excluded.categoryType,
                icon = excluded.icon,
                displayName = excluded.displayName,
                about = excluded.about,
                tags = excluded.tags,
                source = excluded.source,
                updatedDate = excluded.updatedDate,
                createdDate = excluded.createdDate`,
            [
                data.blockId,
                data.ownerId,
                data.categoryType,
                data.icon,
                data.displayName,
                data.about,
                data.tags,
                data.source,
                Date.now().toString(),
                data.createdDate
            ]
        );

        // Do all the rows and fields and values

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
