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

export const getPublishedDatasetController = async (
    req: Request,
    res: Response
) => {
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

        const queryTerm = `%${trimmedQuery}%`;
        const dataQueryTerm = `%${trimmedDataQuery}%`;

        const queryClause = trimmedQuery
            ? `AND (
                p.label LIKE ?
                OR p.description LIKE ?
                OR p.data LIKE ?
                OR p.tags LIKE ?
            )`
            : "";

        const queryParams = trimmedQuery
            ? [
                queryTerm,
                queryTerm,
                queryTerm,
                queryTerm
            ]
            : [];

        const idClause = id
            ? "AND p.id = ?"
            : "";

        const idParams = id
            ? [id]
            : [];

        let formattedSortBy: string;

        switch (sortBy) {
            case "recent":
                formattedSortBy = "p.updatedDate DESC";
                break;

            case "newest":
                formattedSortBy = "p.createdDate DESC";
                break;

            case "oldest":
                formattedSortBy = "p.createdDate ASC";
                break;

            case "nameAsc":
                formattedSortBy = "p.label ASC";
                break;

            case "nameDesc":
                formattedSortBy = "p.label DESC";
                break;

            case "popularAsc":
                formattedSortBy = "p.uses ASC";
                break;

            default:
                formattedSortBy = "p.uses DESC, p.createdDate DESC";
                break;
        }

        const dataExpression = trimmedDataQuery
            ? `
                CASE
                    WHEN json_type(p.data) = 'array' THEN (
                        SELECT COALESCE(
                            json_group_array(json(item.value)),
                            '[]'
                        )
                        FROM (
                            SELECT item.value
                            FROM json_each(p.data) AS item
                            WHERE item.value LIKE ?
                            LIMIT ?
                        ) AS item
                    )

                    WHEN json_type(p.data) = 'object' THEN (
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
                                FROM json_each(p.data) AS category
                                JOIN json_each(category.value) AS item
                                WHERE json_type(category.value) = 'array'
                                    AND item.value LIKE ?
                            )
                            WHERE rowNumber <= ?
                            GROUP BY category
                        )
                    )

                    ELSE p.data
                END
            `
            : "p.data";

        const dataParams = trimmedDataQuery
            ? [
                dataQueryTerm,
                dataLimit === "none" ? 999999 : limit,
                dataQueryTerm,
                dataLimit === "none" ? 999999 : limit
            ]
            : [];

        const result = db.templates.query(
            `
                SELECT
                    p.*,
                    ${dataExpression} AS data
                FROM published_datasets p
                WHERE 1=1
                ${idClause}
                ${queryClause}
                ORDER BY ${formattedSortBy}
                LIMIT ? OFFSET ?
            `,
            [
                ...dataParams,
                ...idParams,
                ...queryParams,
                limit,
                offset
            ]
        );

        assertDbSuccess(result);

        const countResult = db.templates.query<{ total: number }>(
            `
                SELECT COUNT(*) AS total
                FROM published_datasets p
                WHERE 1=1
                ${idClause}
                ${queryClause}
            `,
            [
                ...idParams,
                ...queryParams
            ]
        );

        assertDbSuccess(countResult);

        const parsedRows = result.rows.map(row => ({
            ...row,
            tags: parseJson(row.tags),
            data: parseJson(row.data),
            isRecommended: Boolean(row.isRecommended),
            isSensitive: Boolean(row.isSensitive),
            isMature: Boolean(row.isMature),
        }));

        return res.status(200).json({
            items: parsedRows,
            count: countResult.rows[0]?.total ?? 0
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
