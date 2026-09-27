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
        const id = req.query.id as string | undefined;
        const sortBy = req.query.sortBy as string;

        const limit = Number(req.query.limit) || config.limits.assetsPerPage;
        const offset = Number(req.query.offset) || 0;

        const accessClause = "WHERE d.ownerId = ?";
        const accessParams = [req.session.userId];

        const trimmedQuery = q?.trim();
        const queryTerm = `%${trimmedQuery}%`;

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

        const result = db.templates.query<DatasetItemType>(
            `
                SELECT 
                    d.*,
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
        } else {
            log.unknown.error(error).save();

            return res.status(500).json({
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
