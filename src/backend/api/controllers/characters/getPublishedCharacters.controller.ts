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
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { i18n } from "../../../_common/instances.js";

export const getPublishedCharacters = async (req: Request, res: Response) => {
    try {
        await assertBearer(req); 
        assertPlatformPermissions(req.session, "VIEW");

        const { 
            id, 
            owner, 
            visibility,
            page, 
            limit = config.limits.assetsPerPage,
            q: query,
            ref
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

        const visibilityClause = visibility ? `visibility = ?` : `1 = 1`;
        const visibilityParams = visibility ? [visibility] : [];

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

        const result = db.characters.query<PublishedCharacterType>(
            `
                SELECT * FROM published
                WHERE ${visibilityClause}
                    ${idClause}
                    ${ownerIdClause}
                    ${searchClause}
                ORDER BY ${orderClause}
                LIMIT ? OFFSET ?
            `,
            [
                ...visibilityParams,
                ...idParams,
                ...ownerIdArgs,
                ...searchParams,
                ...orderParams,
                limit,
                offset
            ]
        );

        assertDbSuccess(result);

        const array = Object.values(getPublishedCharactersById(
            result.rows.map((row) => row.id), 
            { 
                getAs: req.session.userId,
                getFrom: ref as string
            }
        ));

        res.status(200).json({
            characters: array,
            pageCount: Math.ceil(array.length / Number(limit)),
            totalCount: array.length
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
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
