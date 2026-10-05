import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../_common/instances.js";
import { log } from "../../instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { MediaType } from "../../../../_common/types/media.type.js";
import { TemplateType } from "../../../../_common/types/template/template.type.js";
import { TemplateCategoryItemType } from "../../../../_common/types/template/category.type.js";
import { TemplateBlockItemType } from "../../../../_common/types/template/block.type.js";
import { TemplateRowItemType } from "../../../../_common/types/template/row.type.js";
import { TemplateFieldItemType } from "../../../../_common/types/template/field.type.js";
import { TemplateValueType } from "../../../../_common/types/template/value.type.js";

export const publishTemplateController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        const getResult = db.templates.query<TemplateType>(
            "SELECT * FROM drafts WHERE id = ? LIMIT 1",
            [id]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.templateNotFound")
            });
        }

        const data = getResult.rows[0];

        if (data.ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        const insertTemplateResult = db.templates.query(
            `INSERT INTO published (
                id,
                ownerId,
                displayName, 
                about,
                tags,
                source,
                uses,
                updatedDate,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                ownerId = excluded.ownerId,
                displayName = excluded.displayName,
                about = excluded.about,
                tags = excluded.tags,
                source = excluded.source,
                uses = excluded.uses,
                updatedDate = excluded.updatedDate,
                createdDate = excluded.createdDate`,
            [
                data.id,
                data.ownerId,
                data.displayName,
                data.about,
                data.tags,
                data.source,
                data.uses,
                Date.now().toString(),
                data.createdDate
            ]
        );

        assertDbSuccess(insertTemplateResult);

        const sourceCategories = db.templates.query<TemplateCategoryItemType>(
            `SELECT *
            FROM draft_categories
            WHERE templateId = ?
            ORDER BY position ASC`,
            [data.id]
        );

        assertDbSuccess(sourceCategories);

        sourceCategories.rows.forEach(category => {
            const result = db.templates.query(
                `INSERT INTO published_categories (
                    templateId,
                    categoryId,
                    types,
                    label,
                    position,
                    createdBy,
                    updatedDate,
                    createdDate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(categoryId) DO UPDATE SET
                    templateId = excluded.templateId,
                    types = excluded.types,
                    label = excluded.label,
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    updatedDate = excluded.updatedDate,
                    createdDate = excluded.createdDate`,
                [
                    category.templateId,
                    category.categoryId,
                    category.types,
                    category.label,
                    category.position,
                    category.createdBy,
                    category.updatedDate,
                    category.createdDate
                ]
            );

            assertDbSuccess(result);
        });

        const sourceBlocks = db.templates.query<TemplateBlockItemType>(
            `SELECT *
            FROM draft_blocks
            WHERE templateId = ?
            ORDER BY position ASC`,
            [data.id]
        );

        assertDbSuccess(sourceBlocks);

        sourceBlocks.rows.forEach(block => {
            const result = db.templates.query(
                `INSERT INTO published_blocks (
                    templateId,
                    blockId,
                    categoryId,
                    sourceBlockId,
                    isSourceBlockConnected,
                    icon,
                    label,
                    description,
                    position,
                    createdBy,
                    updatedDate,
                    createdDate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(blockId) DO UPDATE SET
                    templateId = excluded.templateId,
                    categoryId = excluded.categoryId,
                    sourceBlockId = excluded.sourceBlockId,
                    isSourceBlockConnected = excluded.isSourceBlockConnected,
                    icon = excluded.icon,
                    label = excluded.label,
                    description = excluded.description,
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    updatedDate = excluded.updatedDate,
                    createdDate = excluded.createdDate`,
                [
                    block.templateId,
                    block.blockId,
                    block.categoryId,
                    block.sourceBlockId,
                    block.isSourceBlockConnected,
                    block.icon,
                    block.label,
                    block.description,
                    block.position,
                    block.createdBy,
                    block.updatedDate,
                    block.createdDate
                ]
            );

            assertDbSuccess(result);
        });

        const sourceRows = db.templates.query<TemplateRowItemType>(
            `SELECT *
            FROM draft_rows
            WHERE templateId = ?
            ORDER BY position ASC`,
            [data.id]
        );

        assertDbSuccess(sourceRows);

        sourceRows.rows.forEach(row => {
            const result = db.templates.query(
                `INSERT INTO published_rows (
                    templateId,
                    blockId,
                    rowId,
                    position,
                    createdBy,
                    createdDate
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(rowId) DO UPDATE SET
                    templateId = excluded.templateId,
                    blockId = excluded.blockId,
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    createdDate = excluded.createdDate`,
                [
                    row.templateId,
                    row.blockId,
                    row.rowId,
                    row.position,
                    row.createdBy,
                    row.createdDate
                ]
            );

            assertDbSuccess(result);
        });

        const sourceFields = db.templates.query<TemplateFieldItemType>(
            `SELECT *
            FROM draft_fields
            WHERE templateId = ?
            ORDER BY position ASC`,
            [data.id]
        );

        assertDbSuccess(sourceFields);

        sourceFields.rows.forEach(field => {
            const result = db.templates.query(
                `INSERT INTO published_fields (
                    templateId,
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
                ON CONFLICT(templateId, rowId, fieldId) DO UPDATE SET
                    flex = excluded.flex,
                    type = excluded.type,
                    label = excluded.label,
                    placeholder = excluded.placeholder,
                    options = excluded.options,
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    createdDate = excluded.createdDate`,
                [
                    field.templateId,
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

            assertDbSuccess(result);
        });

        const sourceValues = db.templates.query<TemplateValueType>(
            `SELECT * FROM 
                draft_values 
                WHERE templateId = ?`,
            [data.id]
        );

        assertDbSuccess(sourceValues);

        sourceValues.rows.forEach(value => {
            const insertResult = db.templates.query(
                `INSERT INTO published_values (
                    templateId,
                    fieldId,
                    authorId,
                    content,
                    date
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (templateId, fieldId) DO UPDATE SET
                    authorId = excluded.authorId,
                    content = excluded.content,
                    date = excluded.date`,
                [
                    value.templateId,
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
            [data.id]
        );

        assertDbSuccess(sourceMedia);

        sourceMedia.rows.forEach(media => {
            const insertResult = db.templates.query(
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
                    data.id,
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
