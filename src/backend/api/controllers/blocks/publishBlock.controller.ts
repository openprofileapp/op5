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
import { RowItemType } from "../../../../_common/types/blocks/row.type.js";
import { FieldItemType } from "../../../../_common/types/blocks/field.type.js";
import { ValueType } from "../../../../_common/types/blocks/value.type.js";
import { MediaType } from "../../../../_common/types/media.type.js";

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

        const insertBlockResult = db.blocks.query(
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

        assertDbSuccess(insertBlockResult);

        const sourceRows = db.blocks.query<RowItemType>(
            `SELECT *
            FROM draft_rows
            WHERE blockId = ?
            ORDER BY position ASC`,
            [data.blockId]
        );

        assertDbSuccess(sourceRows);

        sourceRows.rows.forEach(row => {
            const insertRow = db.blocks.query(
                `INSERT INTO published_rows (
                    blockId,
                    rowId,
                    position,
                    createdBy,
                    createdDate
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(rowId) DO UPDATE SET
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    createdDate = excluded.createdDate`,
                [
                    row.blockId,
                    row.rowId,
                    row.position,
                    row.createdBy,
                    row.createdDate
                ]
            );

            assertDbSuccess(insertRow);
        });

        const sourceFields = db.blocks.query<FieldItemType>(
            `SELECT *
            FROM draft_fields
            WHERE blockId = ?
            ORDER BY position ASC`,
            [data.blockId]
        );

        assertDbSuccess(sourceFields);

        sourceFields.rows.forEach(field => {
            const insertField = db.blocks.query(
                `INSERT INTO published_fields (
                    blockId,
                    rowId,
                    fieldId,
                    flex,
                    type,
                    label,
                    placeholder,
                    options,
                    position,
                    createdBy,
                    createdDate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(blockId, rowId, fieldId) DO UPDATE SET
                    flex = excluded.flex,
                    type = excluded.type,
                    label = excluded.label,
                    placeholder = excluded.placeholder,
                    options = excluded.options,
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    createdDate = excluded.createdDate`,
                [
                    field.blockId,
                    field.rowId,
                    field.fieldId,
                    field.flex,
                    field.type ?? "text",
                    field.label ?? "",
                    field.placeholder ?? "",
                    field.options,
                    field.position,
                    field.createdBy,
                    field.createdDate
                ]
            );

            assertDbSuccess(insertField);
        });

        const sourceValues = db.blocks.query<ValueType>(
            `SELECT * FROM 
                draft_values 
                WHERE blockId = ?`,
            [data.blockId]
        );

        assertDbSuccess(sourceValues);

        sourceValues.rows.forEach(value => {
            const insertResult = db.blocks.query(
                `INSERT INTO published_values (
                    blockId,
                    fieldId,
                    authorId,
                    content,
                    date
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (blockId, fieldId) DO UPDATE SET
                    authorId = excluded.authorId,
                    content = excluded.content,
                    date = excluded.date`,
                [
                    value.blockId,
                    value.fieldId,
                    value.authorId,
                    value.content,
                    value.date
                ]
            );

            assertDbSuccess(insertResult);
        });

        const sourceMedia = db.media.query<MediaType>(
            `SELECT * FROM 
                draft_content 
                WHERE assetId = ?`,
            [data.blockId]
        );

        assertDbSuccess(sourceMedia);

        sourceMedia.rows.forEach(media => {
            const insertResult = db.blocks.query(
                `INSERT INTO published_content (
                    assetId,
                    fieldId,
                    url,
                    description,
                    credit,
                    addedBy,
                    date
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (assetId, fieldId) DO UPDATE SET
                    url = excluded.url,
                    description = excluded.description,
                    credit = excluded.credit,
                    addedBy = excluded.addedBy,
                    date = excluded.date`,
                [
                    data.blockId,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    media.fieldId,
                    media.url,
                    media.description,
                    media.credit,
                    media.addedBy,
                    media.date
                ]
            );

            assertDbSuccess(insertResult);
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
