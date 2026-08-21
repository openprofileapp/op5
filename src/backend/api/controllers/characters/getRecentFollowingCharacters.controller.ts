import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { i18n, log } from "../../instances.js";
import { db } from "../../databases/db.js";
import getPublicUserByIdOrUsername from "../../services/getPublicUserByIdOrUsername.service.js";
import { CharacterType } from "../../../../_common/types/queries/character.type.js";
import { InteractionType } from "../../../../_common/types/queries/interaction.type.js";
import { config } from "../../../../../app.config.js";

export const getRecentFollowingCharacters = (req: Request, res: Response) => {
    try {
        const { 
            id, 
            owner, 
            visibility = "public", 
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
            })
        }

        // If not viewed OR dismissed (add dismiss interaction)
        const interactionsResult = db.interactions.query<InteractionType>(
            `
                SELECT DISTINCT target 
                FROM follows 
                WHERE source = ?
                AND target NOT IN (
                    SELECT target 
                    FROM views 
                    WHERE source = ? 
                        AND date >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')
                )
            `,
            [req.session.userId, req.session.userId]
        );

        if (!interactionsResult.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching interactions",
                details: interactionsResult.error
            })
        }

        const trendingTargetIds = interactionsResult.rows.map((row) => row.target);

        if (trendingTargetIds.length === 0) {
            return res.status(200).json({ characters: [], count: 0 });
        }

        const dateClause = `AND updatedDate >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')`;

        const trendingClause = `AND id IN (${trendingTargetIds.map(() => "?").join(",")})`;

        const idClause = id ? "AND id = ?" : "";
        const idParams = id ? [id] : [];

        const ownerIdClause = owner ? "AND ownerId != ?" : "";
        const ownerIdArgs = owner ? [owner] : [];

        const selfExcludeClause = req.session.userId ? "AND ownerId != ?" : "";
        const selfExcludeArgs = req.session.userId ? [req.session.userId] : [];

        const result = db.characters.query<CharacterType>(
            `
                SELECT * FROM published
                WHERE visibility = ?
                    ${dateClause}
                    ${trendingClause}
                    ${idClause}
                    ${ownerIdClause}
                    ${selfExcludeClause}
                ORDER BY updatedDate DESC
                LIMIT ? OFFSET ?
            `,
            [
                visibility,
                ...trendingTargetIds,
                ...idParams,
                ...ownerIdArgs,
                ...selfExcludeArgs,
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
                    ${dateClause}
                    ${trendingClause}
                    ${idClause}
                    ${ownerIdClause}
                    ${selfExcludeClause}
            `,
            [
                visibility,
                ...trendingTargetIds,
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
            })
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
            pageCount: Math.ceil(resultCount.rows[0].count as number / Number(limit))
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
        }
    }
};
