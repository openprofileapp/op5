import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { db } from "../../databases/db.js";
import { PublishedCharacterType } from "../../../../_common/types/character.type.js";
import { config } from "../../../../../app.config.js";
import getUserInterestsById from "../../services/getUserInterestsById.service.js";
import getPublishedCharactersById from "../../services/getPublishedCharactersById.service.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";

export const getTaggedCharacters = async (req: Request, res: Response) => {
    try {
        await assertBearer(req); 
        assertAccount(req.session); 
        assertPlatformPermissions(req.session, "READ");
        
        const { 
            id, 
            owner, 
            visibility = "public", 
            page, 
            limit = config.limits.assetsPerPage 
        } = req.query;

        const { tag } = req.params;

        const offset = 
            (Number(page) || 1) * 
            Number(limit) - 
            Number(limit);

        let userInterests;

        if (req.session?.userId) {
            userInterests = getUserInterestsById(req.session.userId); 
        }

        const userInterestList = userInterests?.interests || [];

        const tagClause = tag ? `AND tags LIKE ?` : "";
        const tagParams = tag ? [`%"${tag}"%`] : [];

        const idClause = id ? "AND id = ?" : "";
        const idParams = id ? [id] : [];

        const ownerIdClause = owner ? "AND ownerId != ?" : "";
        const ownerIdArgs = owner ? [owner] : [];

        const orderClause = userInterestList.length > 0
            ? `(${userInterestList.map(
                    () => "(CASE WHEN tags LIKE ? THEN ? ELSE 0 END)"
                ).join(" + ")}) DESC, algorithmScore DESC`
            : "algorithmScore DESC";

        const orderParams = userInterestList.flatMap(item => [
            `%${item.tag}%`, 
            item.algorithmScore
        ]);

        const result = db.characters.query<PublishedCharacterType>(
            `
                SELECT * FROM published
                WHERE visibility = ?
                    ${tagClause}
                    ${idClause}
                    ${ownerIdClause}
                ORDER BY ${orderClause}
                LIMIT ? OFFSET ?
            `,
            [
                visibility,
                ...tagParams,
                ...idParams,
                ...ownerIdArgs,
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
            });
        }

        const resultCount = db.characters.query(
            `
                SELECT COUNT(*) as count FROM published
                WHERE visibility = ?
                    ${tagClause}
                    ${idClause}
                    ${ownerIdClause}
            `,
            [
                visibility,
                ...tagParams,
                ...idParams,
                ...ownerIdArgs
            ]
        );

        if (!resultCount.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching characters",
                details: resultCount.error
            });
        }

        const characterRecord = result.rows.map((row) => {
            return getPublishedCharactersById(row.id);
        });

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
