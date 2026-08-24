import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { db } from "../../databases/db.js";
import { PublishedCharacterType } from "../../../../_common/types/character.type.js";
import { config } from "../../../../../app.config.js";
import getPublishedCharactersById from "../../services/getPublishedCharactersById.service.js";

export const getRecentCharacters = (req: Request, res: Response) => {
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

        const dateClause = `AND updatedDate >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')`;

        const idClause = id ? "AND id = ?" : "";
        const idParams = id ? [id] : [];

        const ownerIdClause = owner ? "AND ownerId != ?" : "";
        const ownerIdArgs = owner ? [owner] : [];

        const result = db.characters.query<PublishedCharacterType>(
            `
                SELECT * FROM published
                WHERE visibility = ?
                    ${dateClause}
                    ${idClause}
                    ${ownerIdClause}
                ORDER BY updatedDate DESC 
                LIMIT ? OFFSET ?
            `,
            [
                visibility,
                ...idParams,
                ...ownerIdArgs,
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
                    ${idClause}
                    ${ownerIdClause}
            `,
            [
                visibility,
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

        const array = result.rows.map((row) => row.id);

        const characterRecord = getPublishedCharactersById(
            array, 
            {
                getAs: req.session?.userId || req.ip,
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
        }
    }
};
