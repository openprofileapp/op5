import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { config } from "../../../../../app.config.js";
import whatIs from "../../helpers/whatIs.js";

export const getTemplatesController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const id = req.query.id as string | undefined;
        const q = req.query.q as string | undefined;
        const sortBy = req.query.sortBy as string;
        
        const limit = Number(req.query.limit) || config.limits.assetsPerPage;
        const offset = Number(req.query.offset) || 0;

        const accessClause = "WHERE ownerId = ?";
        const accessParams: (string | number)[] = [req.session.userId];

        let idClause = "";
        const idParams: string[] = [];

        if (id) {
            idClause = "AND id = ?";
            idParams.push(id);
        }

        const trimmedQuery = q?.trim();
        const queryTerm = `%${trimmedQuery}%`;

        const queryClause = trimmedQuery
            ? `AND (
                displayName LIKE ? 
                OR about LIKE ?
            )`
            : "";

        const queryParams = trimmedQuery
            ? [queryTerm, queryTerm]
            : [];

        let formattedSortBy: string;

        const primarySourceSort = "CASE WHEN source = 'official' THEN 0 ELSE 1 END ASC";

        switch (sortBy) {
            case "recent":
                formattedSortBy = `${primarySourceSort}, updatedDate DESC`;
                break;
            case "newest":
                formattedSortBy = `${primarySourceSort}, createdDate DESC`;
                break;
            case "oldest":
                formattedSortBy = `${primarySourceSort}, createdDate ASC`;
                break;
            case "nameAsc":
                formattedSortBy = `${primarySourceSort}, label ASC`;
                break;
            case "nameDesc":
                formattedSortBy = `${primarySourceSort}, label DESC`;
                break;
            case "popularAsc":
                formattedSortBy = `${primarySourceSort}, uses ASC`;
                break;
            default:
                formattedSortBy = `${primarySourceSort}, uses DESC, createdDate DESC`;
        }

        const result = db.templates.query(
            `
                SELECT *
                FROM templates
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
                FROM templates
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

        const parsedRows = result.rows.map(({ ownerId, ...row }) => ({
            ...row,
            owner: whatIs(ownerId as string)
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
