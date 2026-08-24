import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { db } from "../../databases/db.js";
import { PublishedCharacterType } from "../../../../_common/types/character.type.js";
import { config } from "../../../../../app.config.js";
import getPublishedCharactersById from "../../services/getPublishedCharactersById.service.js";

export const getTrendingCharacters = (req: Request, res: Response) => {
    try {
        const { 
            id, 
            owner, 
            visibility = "public", 
            page, 
            limit = config.limits.assetsPerPage 
        } = req.query;

        const limitNum = Number(limit) || config.limits.assetsPerPage;
        const pageNum = Number(page) || 1;
        const offset = (pageNum - 1) * limitNum;

        const interactionsResult = db.interactions.query<{ target: string; count: number | string }>(
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
            });
        }

        const targetCountMap = new Map<string, number>();
        interactionsResult.rows.forEach((row) => {
            targetCountMap.set(row.target, Number(row.count) || 0);
        });

        const trendingTargetIds = Array.from(targetCountMap.keys());

        if (trendingTargetIds.length === 0) {
            return res.status(200).json({ characters: [], pageCount: 0 });
        }

        const trendingClause = `AND id IN (${trendingTargetIds.map(() => "?").join(",")})`;

        const idClause = id ? "AND id = ?" : "";
        const idParams = id ? [id] : [];

        const ownerIdClause = owner ? "AND ownerId != ?" : "";
        const ownerIdArgs = owner ? [owner] : [];

        const result = db.characters.query<PublishedCharacterType>(
            `
                SELECT * FROM published
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

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching characters",
                details: result.error
            });
        }

        const sortedCharacters = result.rows
            .map((character) => ({
                ...character,
                interactionCount: targetCountMap.get(character.id) || 0,
            }))
            .sort((a, b) => {
                if (b.interactionCount === a.interactionCount) {
                    return (Number(b.algorithmScore) || 0) - (Number(a.algorithmScore) || 0);
                }
                return b.interactionCount - a.interactionCount;
            });

        const totalItems = sortedCharacters.length;
        const paginatedCharacters = sortedCharacters.slice(offset, offset + limitNum);

        const characterRecord = paginatedCharacters.map((row) => {
            return getPublishedCharactersById(row.id);
        });

        res.status(200).json({
            characters: Object.values(characterRecord),
            pageCount: Math.ceil(totalItems / limitNum),
            totalCount: totalItems
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
