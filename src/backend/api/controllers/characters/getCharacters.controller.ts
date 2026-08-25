import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import getUserInterestsById from "../../services/getUserInterestsById.service.js";
import { db } from "../../databases/db.js";
import { config } from "../../../../../app.config.js";
import getPublishedCharactersById from "../../services/getPublishedCharactersById.service.js";
import { PublishedCharacterType } from "../../../../_common/types/character.type.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";

// Rename to "getPublishedCharacters"
export const getCharacters = async (req: Request, res: Response) => {
    try {
        await assertBearer(req); 
        assertPlatformPermissions(req.session, "READ");

        const { 
            id, 
            owner, 
            visibility = "public", // DEVELOPER NEEDED: Remove the default public for accept all, but still as an option
            page, 
            limit = config.limits.assetsPerPage,
            q: query
        } = req.query;

        const offset = 
            (Number(page) || 1) * 
            Number(limit) - 
            Number(limit);

        let userInterests;

        if (req.session?.userId) {
            userInterests = getUserInterestsById(req.session.userId); 
        }

        const userInterestList = userInterests?.interests || [];

        const idClause = id ? "AND id = ?" : "";
        const idParams = id ? [id] : [];

        const ownerIdClause = owner ? "AND ownerId != ?" : "";
        const ownerIdArgs = owner ? [owner] : [];

        const searchQuery = typeof query === "string" ? query.trim() : "";
        const searchClause = searchQuery 
            ? "AND (displayName LIKE ? OR about LIKE ? OR tags LIKE ?)" 
            : "";
        const searchParams = searchQuery 
            ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] 
            : [];

        const orderClause = userInterestList.length > 0
            ? `(${userInterestList.map(
                    () => "(CASE WHEN tags LIKE ? THEN ? ELSE 0 END)"
                ).join(" + ")}) DESC, algorithmScore DESC`
            : "algorithmScore DESC";

        const orderParams = userInterestList.flatMap(item => [
            `%${item.tag}%`, 
            item.algorithmScore
        ]);

        // DEVELOPER NEEDED: Only display not inside interaction "hides"

        const result = db.characters.query<PublishedCharacterType>(
            `
                SELECT * FROM published
                WHERE visibility = ?
                    ${idClause}
                    ${ownerIdClause}
                    ${searchClause}
                ORDER BY ${orderClause}
                LIMIT ? OFFSET ?
            `,
            [
                "public",
                ...idParams,
                ...ownerIdArgs,
                ...searchParams,
                ...orderParams,
                limit,
                offset
            ]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching characters",
                details: result.error
            })
        }

        const resultCount = db.characters.query(
            `
                SELECT COUNT(*) as count FROM published
                WHERE visibility = ?
                    ${idClause}
                    ${ownerIdClause}
                    ${searchClause}
            `,
            [
                visibility,
                ...idParams,
                ...ownerIdArgs,
                ...searchParams
            ]
        );

        if (!resultCount.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching characters",
                details: resultCount.error
            })
        }

        const characterRecord = getPublishedCharactersById(
            result.rows.map((row) => row.id), 
            {
                getAs: req.session.userId
            }
        );

        res.status(200).json({
            characters: Object.values(characterRecord),
            pageCount: Math.ceil(resultCount.rows[0].count as number / Number(limit)),
            totalCount: resultCount.rows[0].count
        });
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({
                message: "An unexpected error occurred"
            });
        }
    }
};
