import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { db } from "../../databases/db.js";
import getPublicUserByIdOrUsername from "../../services/getPublicUserByIdOrUsername.service.js";
import { CharacterType } from "../../../../_common/types/queries/character.type.js";
import { InteractionType } from "../../../../_common/types/queries/interaction.type.js";
import { config } from "../../../../../app.config.js";

export const getTrendingCharacters = (req: Request, res: Response) => {
    try {
        const { id, owner, visibility = "public", page = 1 } = req.query;

        const offset = 
            (page as number) * 
            config.limits.assetsPerPage - 
            config.limits.assetsPerPage;

        const interactionsResult = db.interactions.query<InteractionType>(
            `
                SELECT target, COUNT(*) as count
                FROM (
                    SELECT target FROM follows WHERE date >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day') 
                    UNION ALL
                    SELECT target FROM likes WHERE date >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day') 
                    UNION ALL
                    SELECT target FROM reads WHERE date >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day') 
                    UNION ALL
                    SELECT target FROM shares WHERE date >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day') 
                    UNION ALL
                    SELECT target FROM views WHERE date >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')
                )
                GROUP BY target
                ORDER BY count DESC
                LIMIT 100
            `
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

        const trendingClause = `AND id IN (${trendingTargetIds.map(() => "?").join(",")})`;

        const idClause = id ? "AND id = ?" : "";
        const idParams = id ? [id] : [];

        const ownerIdClause = owner ? "AND ownerId != ?" : "";
        const ownerIdArgs = owner ? [owner] : [];

        const result = db.characters.query<CharacterType>(
            `
                SELECT * FROM published
                WHERE visibility = ?
                    ${trendingClause}
                    ${idClause}
                    ${ownerIdClause}
                ORDER BY algorithmScore DESC 
                LIMIT ? OFFSET ?
            `,
            [
                visibility,
                ...trendingTargetIds,
                ...idParams,
                ...ownerIdArgs,
                config.limits.assetsPerPage,
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
                    ${trendingClause}
                    ${idClause}
                    ${ownerIdClause}
            `,
            [
                visibility,
                ...trendingTargetIds,
                ...idParams,
                ...ownerIdArgs,
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
        }
    }
};
