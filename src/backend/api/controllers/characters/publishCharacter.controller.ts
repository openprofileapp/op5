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
import { DraftCharacterType } from "../../../../_common/types/characters/character.type.js";
import { DraftCharacterCategoryItemType } from "../../../../_common/types/characters/category.type.js";
import { DraftCharacterBlockItemType } from "../../../../_common/types/characters/block.type.js";
import { DraftCharacterRowItemType } from "../../../../_common/types/characters/row.type.js";
import { DraftCharacterFieldItemType } from "../../../../_common/types/characters/field.type.js";
import { DraftCharacterValueType } from "../../../../_common/types/characters/value.type.js";

export const publishCharacterController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        const getResult = db.characters.query<DraftCharacterType>(
            "SELECT * FROM drafts WHERE id = ? LIMIT 1",
            [id]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.characterNotFound")
            });
        }

        const data = getResult.rows[0];

        if (data.ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        const insertCharacterResult = db.characters.query(
            `INSERT INTO published (
                algorithmScore,
                id,
                ownerId,
                slug,
                displayName,
                avatar,
                animatedAvatar,
                banner,
                about,
                tags,
                license,
                licenseId,
                isAuraEnabled,
                auraType,
                auraPrimary,
                auraSecondary,
                isSensitive,
                isMature,
                visibility,
                readVisibility,
                sendComments,
                isScheduled,
                updatedDate,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                algorithmScore = excluded.algorithmScore,
                ownerId = excluded.ownerId,
                slug = excluded.slug,
                displayName = excluded.displayName,
                avatar = excluded.avatar,
                animatedAvatar = excluded.animatedAvatar,
                banner = excluded.banner,
                about = excluded.about,
                tags = excluded.tags,
                license = excluded.license,
                licenseId = excluded.licenseId,
                isAuraEnabled = excluded.isAuraEnabled,
                auraType = excluded.auraType,
                auraPrimary = excluded.auraPrimary,
                auraSecondary = excluded.auraSecondary,
                isSensitive = excluded.isSensitive,
                isMature = excluded.isMature,
                visibility = excluded.visibility,
                readVisibility = excluded.readVisibility,
                sendComments = excluded.sendComments,
                isScheduled = excluded.isScheduled,
                updatedDate = excluded.updatedDate,
                createdDate = excluded.createdDate`,
            [
                data.algorithmScore,
                data.id,
                data.ownerId,
                data.slug ?? null,
                data.displayName ?? null,
                data.avatar ?? null,
                data.animatedAvatar ?? null,
                data.banner ?? null,
                data.about ?? null,
                data.tags ?? "[]",
                data.license ?? null,
                data.licenseId ?? null,
                data.isAuraEnabled ?? 0,
                data.auraType ?? "flow",
                data.auraPrimary ?? null,
                data.auraSecondary ?? null,
                data.isSensitive ?? 0,
                data.isMature ?? 0,
                data.visibility ?? "public",
                data.readVisibility ?? "default",
                data.sendComments ?? "default",
                data.isScheduled ?? 0,
                new Date().toISOString(),
                data.createdDate
            ]
        );

        assertDbSuccess(insertCharacterResult);

        const sourceCategories = db.characters.query<DraftCharacterCategoryItemType>(
            `SELECT *
            FROM draft_categories
            WHERE assetId = ?
            ORDER BY position ASC`,
            [data.id]
        );

        assertDbSuccess(sourceCategories);

        sourceCategories.rows.forEach(category => {
            const result = db.characters.query(
                `INSERT INTO published_categories (
                    assetId,
                    categoryId,
                    types,
                    label,
                    position,
                    createdBy,
                    updatedDate,
                    createdDate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(categoryId) DO UPDATE SET
                    assetId = excluded.assetId,
                    types = excluded.types,
                    label = excluded.label,
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    updatedDate = excluded.updatedDate,
                    createdDate = excluded.createdDate`,
                [
                    category.assetId,
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

        const sourceBlocks = db.characters.query<DraftCharacterBlockItemType>(
            `SELECT *
            FROM draft_blocks
            WHERE assetId = ?
            ORDER BY position ASC`,
            [data.id]
        );

        assertDbSuccess(sourceBlocks);

        sourceBlocks.rows.forEach(block => {
            const result = db.characters.query(
                `INSERT INTO published_blocks (
                    assetId,
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
                    assetId = excluded.assetId,
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
                    block.assetId,
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

        const sourceRows = db.characters.query<DraftCharacterRowItemType>(
            `SELECT *
            FROM draft_rows
            WHERE assetId = ?
            ORDER BY position ASC`,
            [data.id]
        );

        assertDbSuccess(sourceRows);

        sourceRows.rows.forEach(row => {
            const result = db.characters.query(
                `INSERT INTO published_rows (
                    assetId,
                    blockId,
                    rowId,
                    position,
                    createdBy,
                    createdDate
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(rowId) DO UPDATE SET
                    assetId = excluded.assetId,
                    blockId = excluded.blockId,
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    createdDate = excluded.createdDate`,
                [
                    row.assetId,
                    row.blockId,
                    row.rowId,
                    row.position,
                    row.createdBy,
                    row.createdDate
                ]
            );

            assertDbSuccess(result);
        });

        const sourceFields = db.characters.query<DraftCharacterFieldItemType>(
            `SELECT *
            FROM draft_fields
            WHERE assetId = ?
            ORDER BY position ASC`,
            [data.id]
        );

        assertDbSuccess(sourceFields);

        sourceFields.rows.forEach(field => {
            const result = db.characters.query(
                `INSERT INTO published_fields (
                    assetId,
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
                ON CONFLICT(assetId, rowId, fieldId) DO UPDATE SET
                    flex = excluded.flex,
                    type = excluded.type,
                    label = excluded.label,
                    placeholder = excluded.placeholder,
                    options = excluded.options,
                    position = excluded.position,
                    createdBy = excluded.createdBy,
                    createdDate = excluded.createdDate`,
                [
                    field.assetId,
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

        const sourceValues = db.characters.query<DraftCharacterValueType>(
            `SELECT * FROM 
                draft_values 
                WHERE assetId = ?`,
            [data.id]
        );

        assertDbSuccess(sourceValues);

        sourceValues.rows.forEach(value => {
            const insertResult = db.characters.query(
                `INSERT INTO published_values (
                    assetId,
                    fieldId,
                    authorId,
                    content,
                    date
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (assetId, fieldId) DO UPDATE SET
                    authorId = excluded.authorId,
                    content = excluded.content,
                    date = excluded.date`,
                [
                    value.assetId,
                    value.fieldId,
                    value.authorId,
                    value.content,
                    value.date
                ]
            );

            assertDbSuccess(insertResult);
        });

        const sourceMediaOverview = db.media.query<MediaType>(
            `SELECT * FROM draft_overview WHERE assetId = ?`,
            [data.id]
        );

        assertDbSuccess(sourceMediaOverview);

        const deleteResult = db.media.query(
            `DELETE FROM published_overview WHERE assetId = ?`,
            [data.id]
        );

        assertDbSuccess(deleteResult);

        sourceMediaOverview.rows.forEach(media => {
            const result = db.media.query(
                `INSERT INTO published_overview (
                    assetId,
                    url,
                    description,
                    credit,
                    position,
                    visibility,
                    addedBy,
                    date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (assetId, url) DO UPDATE SET
                    description = excluded.description,
                    credit = excluded.credit,
                    position = excluded.position,
                    visibility = excluded.visibility,
                    addedBy = excluded.addedBy,
                    date = excluded.date`,
                [
                    data.id,
                    media.url,
                    media.description,
                    media.credit,
                    media.position,
                    media.visibility,
                    media.addedBy,
                    media.date
                ]
            );

            assertDbSuccess(result);
        });

        const sourceMediaContent = db.media.query<MediaType>(
            `SELECT * FROM 
                draft_content 
                WHERE assetId = ?`,
            [data.id]
        );

        assertDbSuccess(sourceMediaContent);

        sourceMediaContent.rows.forEach(media => {
            const insertResult = db.media.query(
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
