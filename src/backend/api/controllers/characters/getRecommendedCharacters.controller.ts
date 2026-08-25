import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { i18n, log } from "../../instances.js";
import getUserInterestsById from "../../services/getUserInterestsById.service.js";
import { db } from "../../databases/db.js";
import { PublishedCharacterType } from "../../../../_common/types/character.type.js";
import { config } from "../../../../../app.config.js";
import getPublishedCharactersById from "../../services/getPublishedCharactersById.service.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";

export const getRecommendedCharacters = async (req: Request, res: Response) => {
    try {
        await assertBearer(req); 
        assertAccount(req.session); 
        assertPlatformPermissions(req.session, "READ");
        
        const { 
            id, 
            owner, 
            page, 
            limit = config.limits.assetsPerPage 
        } = req.query;

        const offset = 
            (Number(page) || 1) * 
            Number(limit) - 
            Number(limit);

        if (!req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.noAccount"),
            });
        }

        const userInterests = getUserInterestsById(req.session.userId); 
        const userInterestList = userInterests?.interests || [];

        if (userInterestList.length === 0) {
            return res.status(200).json({ characters: [], count: 0 });
        }

        const interactionResult = db.interactions.query(
            `
                SELECT target FROM dismisses WHERE source = ?
                UNION SELECT target FROM follows WHERE source = ?
                UNION SELECT target FROM likes WHERE source = ?
                UNION SELECT target FROM reads WHERE source = ?
            `,
            [req.session.userId, req.session.userId, req.session.userId, req.session.userId]
        );

        if (!interactionResult.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching interactions",
                details: interactionResult.error
            });
        }

        const likeClauses = userInterestList.map(() => "tags LIKE ?").join(" OR ");
        const likeParams = userInterestList.map(item => `%${item.tag}%`);

        const excludedIds = interactionResult.rows.map(row => row.target);

        const excludeClause = excludedIds.length > 0 
            ? `AND id NOT IN (${excludedIds.map(() => '?').join(',')})` 
            : "";

        const idClause = id ? "AND id = ?" : "";
        const idParams = id ? [id] : [];

        const ownerIdClause = owner ? "AND ownerId != ?" : "";
        const ownerIdArgs = owner ? [owner] : [];

        const selfExcludeClause = req.session.userId ? "AND ownerId != ?" : "";
        const selfExcludeArgs = req.session.userId ? [req.session.userId] : [];

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
                    AND (${likeClauses})
                    ${excludeClause}
                    ${idClause}
                    ${ownerIdClause}
                    ${selfExcludeClause}
                ORDER BY ${orderClause}
                LIMIT ? OFFSET ?
            `,
            [
                "public",
                ...likeParams,
                ...excludedIds,
                ...idParams,
                ...ownerIdArgs,
                ...selfExcludeArgs,
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
                    AND (${likeClauses})
                    ${excludeClause}
                    ${idClause}
                    ${ownerIdClause}
                    ${selfExcludeClause}
            `,
            [
                "public",
                ...likeParams,
                ...excludedIds,
                ...idParams,
                ...ownerIdArgs,
                ...selfExcludeArgs
            ]
        );

        if (!resultCount.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching characters",
                details: resultCount.error
            });
        }

        const array = result.rows.map((row) => row.id);

        const characterRecord = getPublishedCharactersById(
            array, 
            {
                getAs: req.session.userId,
                interactionMethod: "target",
                interactionCountOnly: true
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
