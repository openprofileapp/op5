import type { Request, Response } from 'express';

import { assertBearer } from '../../../_common/asserts/bearer.assert.js';
import { db } from '../../databases/db.js';
import { assertDbSuccess } from '../../../../_common/asserts/dbSuccess.assert.js';
import { AdvancedError } from 'kage-library';
import { log } from '../../instances.js';
import { i18n } from '../../../_common/instances.js';
import { assertAccount } from '../../../_common/asserts/account.assert.js';
import { GetTemplateCategoryItemType } from '../../../../_common/types/template/category.type.js';

export const getTemplateDataController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);

        const result = db.templates.query<Record<string, unknown>>(
            `SELECT 
                c.categoryId,
                c.types,
                c.label,
                c.position,
                c.createdBy,
                c.updatedDate,
                c.createdDate,
                (
                    SELECT json_object(
                        'items', COALESCE(
                            (
                                SELECT json_group_array(
                                    json_object(
                                        'blockId', b.blockId,
                                        'categoryId', b.categoryId,
                                        'sourceBlockId', b.sourceBlockId,
                                        'isSourceBlockConnected', b.isSourceBlockConnected,
                                        'icon', b.icon,
                                        'label', b.label,
                                        'description', b.description,
                                        'position', b.position,
                                        'createdBy', b.createdBy,
                                        'updatedDate', b.updatedDate,
                                        'createdDate', b.createdDate,
                                        'rows', (
                                            SELECT json_object(
                                                'items', COALESCE(
                                                    (
                                                        SELECT json_group_array(
                                                            json_object(
                                                                'rowId', r.rowId,
                                                                'blockId', r.blockId,
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
                                                                                        'rowId', f.rowId,
                                                                                        'flex', f.flex,
                                                                                        'type', f.type,
                                                                                        'label', f.label,
                                                                                        'placeholder', f.placeholder,
                                                                                        'dataset', f.dataset,
                                                                                        'guide', f.guide,
                                                                                        'isLocked', f.isLocked,
                                                                                        'position', f.position,
                                                                                        'createdBy', f.createdBy,
                                                                                        'createdDate', f.createdDate,
                                                                                        'value', (
                                                                                            SELECT json_object(
                                                                                                'authorId', v.authorId,
                                                                                                'content', v.content,
                                                                                                'date', v.date
                                                                                            )
                                                                                            FROM "values" v
                                                                                            WHERE v.fieldId = f.fieldId AND v.templateId = c.templateId
                                                                                            LIMIT 1
                                                                                        )
                                                                                    )
                                                                                )
                                                                                FROM (
                                                                                    SELECT * FROM fields
                                                                                    WHERE rowId = r.rowId AND templateId = c.templateId
                                                                                    ORDER BY position ASC
                                                                                ) f
                                                                            ),
                                                                            json('[]')
                                                                        ),
                                                                        'count', (
                                                                            SELECT COUNT(*) 
                                                                            FROM fields f 
                                                                            WHERE f.rowId = r.rowId AND f.templateId = c.templateId
                                                                        )
                                                                    )
                                                                )
                                                            )
                                                        )
                                                        FROM (
                                                            SELECT * FROM rows
                                                            WHERE blockId = b.blockId AND templateId = c.templateId
                                                            ORDER BY position ASC
                                                        ) r
                                                    ),
                                                    json('[]')
                                                ),
                                                'count', (
                                                    SELECT COUNT(*) 
                                                    FROM rows r 
                                                    WHERE r.blockId = b.blockId AND r.templateId = c.templateId
                                                )
                                            )
                                        )
                                    )
                                )
                                FROM (
                                    SELECT * FROM blocks
                                    WHERE categoryId = c.categoryId AND templateId = c.templateId
                                    ORDER BY position ASC
                                ) b
                            ),
                            json('[]')
                        ),
                        'count', (
                            SELECT COUNT(*) 
                            FROM blocks b 
                            WHERE b.categoryId = c.categoryId AND b.templateId = c.templateId
                        )
                    )
                ) AS blocks
            FROM categories c
            WHERE c.templateId = ?
            ORDER BY c.position ASC`,
            [id]
        );

        assertDbSuccess(result);

        const idPreservingReviver = (key: string, value: unknown) => {
            if (
                value !== null &&
                value !== undefined &&
                (key.endsWith("Id") || key === "createdBy" || key === "authorId")
            ) {
                return String(value);
            }
            return value;
        };

        const parseJSONRecursively = (obj: unknown): unknown => {
            if (typeof obj === "string") {
                try {
                    return parseJSONRecursively(JSON.parse(obj, idPreservingReviver));
                } catch {
                    return obj;
                }
            }
            if (Array.isArray(obj)) {
                return obj.map(parseJSONRecursively);
            }
            if (obj !== null && typeof obj === "object") {
                return Object.entries(obj).reduce((acc, [key, value]) => {
                    if (key.endsWith("Id") || key === "createdBy" || key === "authorId") {
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
            parseJSONRecursively(category) as GetTemplateCategoryItemType
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
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
