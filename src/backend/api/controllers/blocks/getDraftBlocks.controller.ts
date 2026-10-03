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

export const getDraftBlocksController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const id = req.query.id as string | undefined;
        const q = req.query.q as string | undefined;
        const sortBy = req.query.sortBy as string;
        const types = req.query.types as string | undefined;

        const limit = Number(req.query.limit) || config.limits.assetsPerPage;
        const offset = Number(req.query.offset) || 0;

        const accessClause = "WHERE d.ownerId = ?";
        const accessParams: (string | number)[] = [req.session.userId];

        let idClause = "";
        const idParams: string[] = [];

        if (id) {
            idClause = "AND d.blockId = ?";
            idParams.push(id);
        }

        const trimmedQuery = q?.trim();
        const queryTerm = `%${trimmedQuery}%`;

        const queryClause = trimmedQuery
            ? `AND (
                d.displayName LIKE ?
                OR d.about LIKE ?
                OR d.tags LIKE ?
                OR d.categoryType LIKE ?
            )`
            : "";

        const queryParams = trimmedQuery
            ? [queryTerm, queryTerm, queryTerm, queryTerm]
            : [];

        const requestedTypes = (types ?? "")
            .split(",")
            .map((type) => type.trim())
            .filter(Boolean);

        const typeClause = requestedTypes.length
            ? `
                AND (
                    ${requestedTypes
                        .map(
                            () => `
                                d.categoryType LIKE ?
                                OR d.categoryType LIKE ?
                            `
                        )
                        .join(" OR ")}
                )
            `
            : "";

        const typeParams = requestedTypes.flatMap((type) => [
            `%"${type}"%`,
            `%${type}%`,
        ]);

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

        const result = db.blocks.query(
            `
                SELECT
                    d.*,
                    CASE
                        WHEN p.blockId IS NOT NULL THEN 1
                        ELSE 0
                    END AS isPublished
                FROM drafts d
                LEFT JOIN published p
                    ON d.blockId = p.blockId
                ${accessClause}
                ${idClause}
                ${queryClause}
                ${typeClause}
                ORDER BY ${formattedSortBy}
                LIMIT ? OFFSET ?
            `,
            [
                ...accessParams,
                ...idParams,
                ...queryParams,
                ...typeParams,
                limit,
                offset
            ]
        );

        assertDbSuccess(result);

        const countResult = db.blocks.query(
            `
                SELECT 1
                FROM drafts d
                ${accessClause}
                ${idClause}
                ${queryClause}
                ${typeClause}
            `,
            [
                ...accessParams,
                ...idParams,
                ...queryParams,
                ...typeParams
            ]
        );

        assertDbSuccess(countResult);

        const parsedRows = result.rows.map(({ ownerId, ...row }) => ({
            ...row,
            owner: whatIs(ownerId as string),
            tags: parseJson(row.tags),
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
