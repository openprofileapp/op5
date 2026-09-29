import type { Request, Response } from 'express';

import { assertBearer } from '../../../_common/asserts/bearer.assert.js';
import { db } from '../../databases/db.js';
import { assertDbSuccess } from '../../../../_common/asserts/dbSuccess.assert.js';
import { AdvancedError } from 'kage-library';
import { log } from '../../instances.js';
import { i18n } from '../../../_common/instances.js';
import { assertAccount } from '../../../_common/asserts/account.assert.js';
import { GetBlockItemType } from '../../../../_common/types/blocks/block.type.js';

export const getPublishedBlockDataController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);

        const result = db.blocks.query(
            `SELECT COALESCE(
                (
                    SELECT json_group_array(
                        json_object(
                            'rowId', r.rowId,
                            'position', r.position,
                            'createdBy', r.createdBy,
                            'createdDate', r.createdDate,
                            'fields', (
                                SELECT json_object(
                                    'items', COALESCE(
                                        (
                                            SELECT json_group_array(
                                                json_object(
                                                    'fieldId', f.fieldId,
                                                    'flex', f.flex,
                                                    'type', f.type,
                                                    'label', f.label,
                                                    'placeholder', f.placeholder,
                                                    'options', f.options,
                                                    'guide', f.guide,
                                                    'isLocked', f.isLocked,
                                                    'position', f.position,
                                                    'createdBy', f.createdBy,
                                                    'updatedDate', f.updatedDate,
                                                    'createdDate', f.createdDate,
                                                    'value', CASE 
                                                        WHEN f.type = 'media' THEN (
                                                            SELECT json_object(
                                                                'authorId', m.addedBy,
                                                                'content', m.url,
                                                                'date', m.date
                                                            )
                                                            FROM media.published_content m
                                                            WHERE m.fieldId = f.fieldId AND m.assetId = ?
                                                            LIMIT 1
                                                        )
                                                        ELSE (
                                                            SELECT json_object(
                                                                'authorId', v.authorId,
                                                                'content', v.content,
                                                                'date', v.date
                                                            )
                                                            FROM published_values v
                                                            WHERE v.fieldId = f.fieldId AND v.blockId = ?
                                                            LIMIT 1
                                                        )
                                                    END
                                                )
                                            )
                                            FROM (
                                                SELECT * FROM published_fields
                                                WHERE rowId = r.rowId AND blockId = ?
                                                ORDER BY position ASC
                                            ) f
                                        ),
                                        json('[]')
                                    ),
                                    'count', (
                                        SELECT COUNT(*) 
                                        FROM published_fields f 
                                        WHERE f.rowId = r.rowId AND f.blockId = ?
                                    )
                                )
                            )
                        )
                    )
                    FROM (
                        SELECT * FROM published_rows
                        WHERE blockId = ?
                        ORDER BY position ASC
                    ) r
                ),
                json('[]')
            ) AS rows`,
            [id, id, id, id, id]
        );

        assertDbSuccess(result);

        if (result.rows.length === 0) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.notFound")
            });
        }

        const idPreservingReviver = (key: string, value: unknown) => {
            if (
                value !== null &&
                value !== undefined &&
                (key.endsWith("Id") || key === "createdBy" || key === "authorId" || key === "ownerId")
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
                        key.endsWith("Id") ||
                        key === "createdBy" ||
                        key === "authorId" ||
                        key === "ownerId"
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

        const rawRows = typeof result.rows[0].rows === 'string' 
            ? JSON.parse(result.rows[0].rows, idPreservingReviver)
            : result.rows[0].rows;

        const rowsData = parseJSONRecursively(rawRows) as GetBlockItemType[];

        return res.status(200).json(rowsData);
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
