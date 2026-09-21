import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { config } from "../../../../../app.config.js";
import { parseJson } from "../../../_common/helpers/parseJson.js";

export const templateBlockController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const typesParam = req.query.types as string | undefined;
        const types = typesParam ? typesParam.split(",").map(t => t.trim()).filter(Boolean) : [];

        if (types.length === 0) {
            return res.status(200).json({
                items: [],
                count: 0
            });
        }

        const q = req.query.q as string | undefined;
        const sortBy = req.query.sortBy as string;
        
        const limit = Number(req.query.limit) || config.limits.assetsPerPage;
        const offset = Number(req.query.offset) || 0;

        const typesClause = `AND categoryType IN (${types.map(() => "?").join(",")})`;
        const typesParams = types;

        const trimmedQuery = q?.trim();
        const queryTerm = `%${trimmedQuery}%`;

        const queryClause = trimmedQuery
            ? `AND (
                label LIKE ? 
                OR description LIKE ? 
                OR tags LIKE ?
            )`
            : "";

        const queryParams = trimmedQuery
            ? [queryTerm, queryTerm, queryTerm]
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
                FROM blocks
                WHERE visibility = 'public'
                    ${typesClause}
                    ${queryClause}
                ORDER BY ${formattedSortBy}
                LIMIT ? OFFSET ?
            `,
            [
                ...typesParams,
                ...queryParams,
                limit,
                offset
            ]
        );

        assertDbSuccess(result);

        const countResult = db.templates.query<{ total: number }>(
            `
                SELECT 1
                FROM blocks
                WHERE visibility = 'public'
                    ${typesClause}
                    ${queryClause}
            `,
            [
                ...typesParams,
                ...queryParams
            ]
        );

        assertDbSuccess(countResult);

        const parsedRows = result.rows.map(row => ({
            ...row,
            tags: parseJson(row.tags),
            isRecommended: Boolean(row.isRecommended),
            isSensitive: Boolean(row.isSensitive),
            isMature: Boolean(row.isMature),
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
