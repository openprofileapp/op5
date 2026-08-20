import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { i18n, log } from "../../instances.js";
import getUserInterestsById from "../../services/getUserInterestsById.service.js";
import { db } from "../../databases/db.js";
import getPublicUserByIdOrUsername from "../../services/getPublicUserByIdOrUsername.service.js";
import { CharacterType } from "../../../../_common/types/queries/character.type.js";
import { config } from "../../../../../app.config.js";

export const getRecommendedCharacters = (req: Request, res: Response) => {
    try {
        const { id, owner, page } = req.query;

        const offset = 
            (Number(page) || 1) * 
            config.limits.assetsPerPage - 
            config.limits.assetsPerPage;

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

        // DEVELOPER NEEDED: Add notInterested interaction to the list
        // If not dismissed (add dismiss interaction)
        const interactionResult = db.interactions.query(
            `
                SELECT target FROM reads WHERE source = ?
                UNION SELECT target FROM likes WHERE source = ?
                UNION SELECT target FROM follows WHERE source = ?
            `,
            [req.session.userId, req.session.userId, req.session.userId]
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

        const result = db.characters.query<CharacterType>(
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
                config.limits.assetsPerPage,
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

        const characters = result.rows.map((d) => {
            const owner = getPublicUserByIdOrUsername(d.ownerId);

            return {
                ...d,

                owner: owner
                    ? {
                        id: owner.id,
                        username: owner.username,
                        displayName: owner.displayName,
                        badges: owner.badges,
                        type: owner.type
                    }
                    : null
            };
        });

        res.status(200).json({
            characters,
            count: resultCount.rows[0].count
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
