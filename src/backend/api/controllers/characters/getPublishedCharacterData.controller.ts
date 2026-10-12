import type { Request, Response } from 'express';

import { assertBearer } from '../../../_common/asserts/bearer.assert.js';
import { db } from '../../databases/db.js';
import { assertDbSuccess } from '../../../../_common/asserts/dbSuccess.assert.js';
import { AdvancedError } from 'kage-library';
import { log } from '../../instances.js';
import { i18n } from '../../../_common/instances.js';
import { assertAccount } from '../../../_common/asserts/account.assert.js';
import { GetPublishedCharacterCategoryItemType } from '../../../../_common/types/characters/category.type.js';

export const getPublishedCharacterDataController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);

        const result = db.characters.query<Record<string, unknown>>(
            `SELECT
                c.categoryId,
                c.label,
                c.position,
                (
                    SELECT json_object(
                        'items', COALESCE(
                            (
                                SELECT json_group_array(
                                    json_object(
                                        'blockId', b.blockId,
                                        'categoryId', b.categoryId,
                                        'icon', b.icon,
                                        'label', b.label,
                                        'description', b.description,
                                        'position', b.position,
                                        'rows', (
                                            SELECT json_object(
                                                'items', COALESCE(
                                                    (
                                                        SELECT json_group_array(
                                                            json_object(
                                                                'rowId', r.rowId,
                                                                'blockId', r.blockId,
                                                                'position', r.position,
                                                                'fields', (
                                                                    SELECT json_object(
                                                                        'items', COALESCE(
                                                                            (
                                                                                SELECT json_group_array(
                                                                                    json_object(
                                                                                        'fieldId', f.fieldId,
                                                                                        'rowId', f.rowId,
                                                                                        'flex', f.flex,
                                                                                        'type', f.type,
                                                                                        'label', f.label,
                                                                                        'position', f.position,
                                                                                        'value', CASE
                                                                                            WHEN f.type = 'media' THEN (
                                                                                                SELECT json_object(
                                                                                                    'authorId', m.addedBy,
                                                                                                    'content', m.url,
                                                                                                    'date', m.date,
                                                                                                    'options', json_object(
                                                                                                        'description', m.description,
                                                                                                        'credit', m.credit
                                                                                                    )
                                                                                                )
                                                                                                FROM media.published_content m
                                                                                                WHERE m.fieldId = f.fieldId
                                                                                                    AND m.assetId = c.assetId
                                                                                                LIMIT 1
                                                                                            )
                                                                                            ELSE (
                                                                                                SELECT json_object(
                                                                                                    'content', v.content
                                                                                                )
                                                                                                FROM published_values v
                                                                                                WHERE v.fieldId = f.fieldId
                                                                                                    AND v.assetId = c.assetId
                                                                                                LIMIT 1
                                                                                            )
                                                                                        END
                                                                                    )
                                                                                )
                                                                                FROM (
                                                                                    SELECT *
                                                                                    FROM published_fields
                                                                                    WHERE rowId = r.rowId
                                                                                        AND assetId = c.assetId
                                                                                    ORDER BY position ASC
                                                                                ) f
                                                                            ),
                                                                            json('[]')
                                                                        ),
                                                                        'count', (
                                                                            SELECT COUNT(*)
                                                                            FROM published_fields f
                                                                            WHERE f.rowId = r.rowId
                                                                                AND f.assetId = c.assetId
                                                                        )
                                                                    )
                                                                )
                                                            )
                                                        )
                                                        FROM (
                                                            SELECT *
                                                            FROM published_rows
                                                            WHERE blockId = b.blockId
                                                                AND assetId = c.assetId
                                                            ORDER BY position ASC
                                                        ) r
                                                    ),
                                                    json('[]')
                                                ),
                                                'count', (
                                                    SELECT COUNT(*)
                                                    FROM published_rows r
                                                    WHERE r.blockId = b.blockId
                                                        AND r.assetId = c.assetId
                                                )
                                            )
                                        )
                                    )
                                )
                                FROM (
                                    SELECT *
                                    FROM published_blocks
                                    WHERE categoryId = c.categoryId
                                        AND assetId = c.assetId
                                    ORDER BY position ASC
                                ) b
                            ),
                            json('[]')
                        ),
                        'count', (
                            SELECT COUNT(*)
                            FROM published_blocks b
                            WHERE b.categoryId = c.categoryId
                                AND b.assetId = c.assetId
                        )
                    )
                ) AS blocks
            FROM published_categories c
            WHERE c.assetId = ?
            ORDER BY c.position ASC`,
            [id]
        );

        assertDbSuccess(result);

        const idPreservingReviver = (key: string, value: unknown) => {
            if (
                value !== null &&
                value !== undefined &&
                (
                    key.endsWith("Id") ||
                    key === "createdBy" ||
                    key === "authorId"
                )
            ) {
                return String(value);
            }

            return value;
        };

        const parseJSONRecursively = (obj: unknown): unknown => {
            if (typeof obj === "string") {
                const trimmed = obj.trim();

                if (
                    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
                    (trimmed.startsWith("[") && trimmed.endsWith("]"))
                ) {
                    try {
                        return parseJSONRecursively(
                            JSON.parse(trimmed, idPreservingReviver)
                        );
                    } catch {
                        return obj;
                    }
                }

                return obj;
            }

            if (Array.isArray(obj)) {
                return obj.map(parseJSONRecursively);
            }

            if (obj !== null && typeof obj === "object") {
                return Object.entries(obj).reduce((acc, [key, value]) => {
                    if (
                        (
                            key.endsWith("Id") ||
                            key === "createdBy" ||
                            key === "authorId"
                        ) &&
                        value !== null &&
                        value !== undefined
                    ) {
                        acc[key] = String(value);
                    } else {
                        acc[key] = parseJSONRecursively(value);
                    }

                    return acc;
                }, {} as Record<string, unknown>);
            }

            return obj;
        };

        const items = result.rows.map((category) =>
            parseJSONRecursively(category) as GetPublishedCharacterCategoryItemType
        );

        return res.status(200).json(items);

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
                message: i18n.t("responses.unknown")
            });
        }
    }
};
