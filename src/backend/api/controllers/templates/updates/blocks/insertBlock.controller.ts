import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { log, snowflake } from "../../../../instances.js";
import { assertBearer } from "../../../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../../../_common/instances.js";
import { db } from "../../../../databases/db.js";
import { assertDbSuccess } from "../../../../../../_common/asserts/dbSuccess.assert.js";
import uploadFile from "../../../../../_common/helpers/uploadFile.js";
import { BlockItemType } from "../../../../../../_common/types/blocks/block.type.js";
import { RowItemType } from "../../../../../../_common/types/blocks/row.type.js";
import { FieldItemType } from "../../../../../../_common/types/blocks/field.type.js";
import { ValueType } from "../../../../../../_common/types/blocks/value.type.js";
import { MediaType } from "../../../../../../_common/types/media.type.js";
import { config } from "../../../../../../../app.config.js";
import { updateBlockUses } from "../../../../helpers/manageUses.js";

export const insertBlock = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params;
        const { blockId, categoryId, sourceBlockId, icon, label, description, position } = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "WRITE");

        const getResult = db.templates.query(
            "SELECT * FROM drafts WHERE id = ?",
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

        if (!blockId || typeof blockId !== "string" || !categoryId || typeof categoryId !== "string") {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const countResult = db.templates.query<{ count: number }>(
            "SELECT 1 FROM draft_blocks WHERE templateId = ?",
            [templateId]
        );

        assertDbSuccess(countResult);

        if (countResult.rowCount >= 32) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.blockLimit")
            });
        }

        const targetPosition = 
            typeof position === "number" 
                ? position 
                : countResult.rowCount;

        let finalIcon = icon;

        if (icon) {
            if (typeof icon === "string" && icon.startsWith("data:")) {
                const uploadedIcon = await uploadFile({
                    folder: `media/${blockId}`,
                    fileInput: icon,
                });

                if (!uploadedIcon?.path) {
                    throw new AdvancedError({
                        code: 500,
                        message: i18n.t("responses.unknown"),
                    });
                }

                finalIcon = uploadedIcon.path;
            }

            finalIcon = finalIcon?.replace(`https://${config.domains.cdn}`, "")
        }

        const insertResult = db.templates.query(
            `INSERT INTO draft_blocks (
                templateId, 
                blockId, 
                categoryId, 
                sourceBlockId, 
                icon, 
                label, 
                description, 
                position, 
                createdBy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                templateId,
                blockId,
                categoryId,
                sourceBlockId ?? null,
                finalIcon || null,
                label ?? null,
                description ?? null,
                targetPosition,
                req.session.userId
            ]
        );

        assertDbSuccess(insertResult);

        if (sourceBlockId) {
            let isDraftBlock: boolean = true;

            const getBlock = db.blocks.query<BlockItemType>(
                `SELECT 1 FROM drafts WHERE blockId = ? AND ownerId = ?`,
                [sourceBlockId, req.session.userId]
            );

            assertDbSuccess(getBlock);

            if (getBlock.rowCount === 0) {
                isDraftBlock = false;
            } 

            const sourceRows = db.blocks.query<RowItemType>(
                `SELECT *
                FROM ${isDraftBlock ? "draft" : "published"}_rows
                WHERE blockId = ?
                ORDER BY position ASC`,
                [sourceBlockId]
            );

            assertDbSuccess(sourceRows);

            sourceRows.rows.forEach(row => {
                const newRowId = snowflake.gen();

                const insertRow = db.templates.query(
                    `INSERT INTO draft_rows (
                        templateId,
                        rowId,
                        blockId,
                        position,
                        createdBy
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        templateId,
                        newRowId,
                        blockId,
                        row.position,
                        req.session.userId
                    ]
                );

                assertDbSuccess(insertRow);

                const sourceFields = db.blocks.query<FieldItemType>(
                    `SELECT *
                    FROM ${isDraftBlock ? "draft" : "published"}_fields
                    WHERE blockId = ?
                    AND rowId = ?
                    ORDER BY position ASC`,
                    [sourceBlockId, row.rowId]
                );

                assertDbSuccess(sourceFields);

                sourceFields.rows.forEach(field => {
                    const getFieldIdResult = db.templates.query(
                        "SELECT * FROM draft_fields WHERE fieldId = ? AND templateId = ?",
                        [field.fieldId, templateId]
                    );

                    assertDbSuccess(getFieldIdResult);

                    if (getFieldIdResult.rowCount !== 0) {
                        field.fieldId = `${field.fieldId}-${snowflake.gen()}`
                    }

                    const insertField = db.templates.query(
                        `INSERT INTO draft_fields (
                            templateId,
                            rowId,
                            fieldId,
                            flex,
                            type,
                            label,
                            placeholder,
                            options,
                            guide,
                            position,
                            createdBy
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            templateId,
                            newRowId,
                            field.fieldId,
                            field.flex,
                            field.type ?? "text",
                            field.label ?? "",
                            field.placeholder ?? "",
                            JSON.stringify(field.options ?? []),
                            field.guide ?? "",
                            field.position,
                            req.session.userId
                        ]
                    );

                    assertDbSuccess(insertField);

                    if (field.options?.dataset) {
                        const updateResult = db.templates.query(
                            `UPDATE draft_datasets
                            SET uses = uses + 1
                            WHERE id = ?`,
                            [field.options?.dataset]
                        );

                        assertDbSuccess(updateResult);
                    }
                });
            });

            const sourceValues = db.blocks.query<ValueType>(
                `SELECT * FROM 
                    ${isDraftBlock ? "draft" : "published"}_values 
                    WHERE blockId = ?`,
                [sourceBlockId]
            );

            assertDbSuccess(sourceValues);

            sourceValues.rows.forEach(value => {
                const insertResult = db.templates.query(
                    `INSERT INTO draft_values (
                        templateId,
                        fieldId,
                        authorId,
                        content
                    ) VALUES (?, ?, ?, ?)
                    ON CONFLICT (templateId, fieldId) DO UPDATE SET
                        authorId = excluded.authorId,
                        content = excluded.content`,
                    [
                        templateId,
                        value.fieldId,
                        req.session.userId,
                        value.content
                    ]
                );

                assertDbSuccess(insertResult);
            });

            const sourceMedia = db.media.query<MediaType>(
                `SELECT * FROM 
                    ${isDraftBlock ? "draft" : "published"}_content 
                    WHERE assetId = ?`,
                [sourceBlockId]
            );

            assertDbSuccess(sourceMedia);

            sourceMedia.rows.forEach(media => {
                const insertResult = db.templates.query(
                    `INSERT INTO draft_content (
                        assetId,
                        fieldId,
                        url,
                        description,
                        credit,
                        addedBy
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT (assetId, fieldId) DO UPDATE SET
                        url = excluded.url,
                        description = excluded.description,
                        credit = excluded.credit,
                        addedBy = excluded.addedBy`,
                    [
                        templateId,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        media.fieldId,
                        media.url,
                        media.description,
                        media.credit,
                        req.session.userId
                    ]
                );

                assertDbSuccess(insertResult);
            });

            updateBlockUses(sourceBlockId, "add");
        }

        return res.status(201).json({
            ok: true,
        });
    } catch (error) {
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
