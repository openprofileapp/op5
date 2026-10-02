import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { i18n } from "../../../_common/instances.js";
import { log } from "../../instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { config } from "../../../../../app.config.js";
import { parseJson } from "../../../_common/helpers/parseJson.js";
import { DatasetItemType } from "../../../../_common/types/template/dataset.type.js";

export const getDraftDatasetController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const q = req.query.q as string | undefined;
        const dq = req.query.dq as string | undefined;

        const id = req.query.id as string | undefined;
        const sortBy = req.query.sortBy as string;

        const limit = Number(req.query.limit) || config.limits.assetsPerPage;
        const dataLimit = req.query.dataLimit;

        const offset = Number(req.query.offset) || 0;

        const trimmedQuery = q?.trim();
        const trimmedDataQuery = dq?.trim();

        if (trimmedDataQuery && !id) {
            return res.status(400).json({
                message: "An id is required when using data query."
            });
        }

        const accessClause = "WHERE d.ownerId = ?";
        const accessParams = [req.session.userId];

        const queryTerm = `%${trimmedQuery}%`;
        const dataQueryTerm = `%${trimmedDataQuery}%`;

        const queryClause = trimmedQuery
            ? `AND (
                d.label LIKE ?
                OR d.description LIKE ?
                OR d.data LIKE ?
                OR d.tags LIKE ?
            )`
            : "";

        const queryParams = trimmedQuery
            ? [queryTerm, queryTerm, queryTerm, queryTerm]
            : [];

        const idClause = id
            ? "AND d.id = ?"
            : "";

        const idParams = id
            ? [id]
            : [];

        let formattedSortBy: string;

        switch (sortBy) {
            case "recent":
                formattedSortBy = "d.updatedDate DESC";
                break;

            case "newest":
                formattedSortBy = "d.createdDate DESC";
                break;

            case "oldest":
                formattedSortBy = "d.createdDate ASC";
                break;

            case "nameAsc":
                formattedSortBy = "d.label ASC";
                break;

            case "nameDesc":
                formattedSortBy = "d.label DESC";
                break;

            case "popularAsc":
                formattedSortBy = "d.uses ASC";
                break;

            default:
                formattedSortBy = "d.uses DESC, d.createdDate DESC";
        }

        const dataExpression = `
            CASE
                WHEN json_type(d.data) = 'array' THEN (
                    SELECT COALESCE(
                        json_group_array(json(item.value)),
                        '[]'
                    )
                    FROM (
                        SELECT item.value
                        FROM json_each(d.data) AS item
                        WHERE ? IS NULL
                            OR item.value LIKE ?
                        LIMIT ?
                    ) AS item
                )

                WHEN json_type(d.data) = 'object' THEN (
                    SELECT COALESCE(
                        json_group_object(
                            category,
                            json(items)
                        ),
                        '{}'
                    )
                    FROM (
                        SELECT
                            category,
                            json_group_array(json(value)) AS items
                        FROM (
                            SELECT
                                category.key AS category,
                                item.value AS value,
                                ROW_NUMBER() OVER () AS rowNumber
                            FROM json_each(d.data) AS category
                            JOIN json_each(category.value) AS item
                            WHERE json_type(category.value) = 'array'
                                AND (
                                    ? IS NULL
                                    OR item.value LIKE ?
                                )
                        )
                        WHERE rowNumber <= ?
                        GROUP BY category
                    )
                )

                ELSE d.data
            END
        `;

        const dataParams = [
            trimmedDataQuery || null,
            dataQueryTerm,
            dataLimit === "none" ? 999999 : limit,
            trimmedDataQuery || null,
            dataQueryTerm,
            dataLimit === "none" ? 999999 : limit
        ];

        const result = db.templates.query<DatasetItemType>(
            `
                SELECT
                    d.*,
                    ${dataExpression} AS data,
                    CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END AS isPublished
                FROM draft_datasets d
                LEFT JOIN published_datasets p ON d.id = p.id
                ${accessClause}
                ${idClause}
                ${queryClause}
                ORDER BY ${formattedSortBy}
                LIMIT ? OFFSET ?
            `,
            [
                ...dataParams,
                ...accessParams,
                ...idParams,
                ...queryParams,
                limit,
                offset
            ]
        );

        assertDbSuccess(result);

        const countResult = db.templates.query<{ total: number }>(
            `
                SELECT 1
                FROM draft_datasets d
                ${accessClause}
                ${idClause}
                ${queryClause}
            `,
            [
                ...accessParams,
                ...idParams,
                ...queryParams
            ]
        );

        assertDbSuccess(countResult);

        const parsedRows = result.rows.map(row => ({
            ...row,
            tags: parseJson(row.tags),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            isPublished: Boolean(row.isPublished)
        }));

        return res.status(200).json({
            items: parsedRows,
            count: countResult.rowCount
        });
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();

            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        }

        log.unknown.error(error).save();

        return res.status(500).json({
            message: i18n.t("responses.unknown"),
        });
    }
};
