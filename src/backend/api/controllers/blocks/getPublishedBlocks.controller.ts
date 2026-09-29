import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { config } from "../../../../../app.config.js";
import whatIs from "../../services/whatIs.service.js";
import { parseJson } from "../../../_common/helpers/parseJson.js";

export const getPublishedBlocksController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const id = req.query.id as string | undefined;
        const q = req.query.q as string | undefined;
        const sortBy = req.query.sortBy as string;
        
        const limit = Number(req.query.limit) || config.limits.assetsPerPage;
        const offset = Number(req.query.offset) || 0;

        let idClause = "";
        const idParams: string[] = [];

        if (id) {
            idClause = "AND blockId = ?";
            idParams.push(id);
        }

        const trimmedQuery = q?.trim();
        const queryTerm = `%${trimmedQuery}%`;

        const queryClause = trimmedQuery
            ? `AND (
                displayName LIKE ? 
                OR about LIKE ?
                OR tags LIKE ?
                OR categoryType LIKE ?
            )`
            : "";

        const queryParams = trimmedQuery
            ? [queryTerm, queryTerm, queryTerm, queryTerm]
            : [];

        let formattedSortBy: string;

        switch (sortBy) {
            case "recent":
                formattedSortBy = "updatedDate DESC";
                break;
            case "newest":
                formattedSortBy = "createdDate DESC";
                break;
            case "oldest":
                formattedSortBy = "createdDate ASC";
                break;
            case "nameAsc":
                formattedSortBy = "label ASC";
                break;
            case "nameDesc":
                formattedSortBy = "label DESC";
                break;
            case "popularAsc":
                formattedSortBy = "uses ASC";
                break;
            default:
                formattedSortBy = "uses DESC, createdDate DESC";
        }

        const result = db.blocks.query(
            `
                SELECT *
                FROM published
                WHERE 1=1
                ${idClause}
                ${queryClause}
                ORDER BY ${formattedSortBy}
                LIMIT ? OFFSET ?
            `,
            [
                ...idParams,
                ...queryParams,
                limit,
                offset
            ]
        );

        assertDbSuccess(result);

        const countResult = db.blocks.query<{ total: number }>(
            `
                SELECT 1
                FROM published
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

        const parsedRows = result.rows.map(({ ownerId, ...row }) => ({
            ...row,
            owner: whatIs(ownerId as string),
            tags: parseJson(row.tags)
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
