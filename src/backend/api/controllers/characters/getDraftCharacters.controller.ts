import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { config } from "../../../../../app.config.js";
import getDraftCharactersService from "../../services/getDraftCharacters.service.js";
import { SortByType } from "../../../../_common/types/sortBy.type.js";
import { i18n } from "../../../_common/instances.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";

export const getDraftCharacters = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "VIEW");

        const {
            id,
            owner,
            sortBy,
            page,
            limit = config.limits.assetsPerPage,
            q: query,
            includeMedia,
            isTrash
        } = req.query;

        const parsedLimit = Number(limit);

        const offset =
            (Number(page) || 1) *
            parsedLimit -
            parsedLimit;

        const characters = getDraftCharactersService({
            id: id as string,
            ownerId: owner as string,
            sortBy: sortBy as SortByType,
            offset,
            limit: parsedLimit,
            query: query as string,
            getAs: req.session.userId || req.ip,
            includeMedia: includeMedia === "true",
            isTrash: isTrash === "true"
        });

        const items = characters.items;

        const characterIds = items.map((item) => item.id);

        let publishedIds = new Set<string>();

        if (characterIds.length > 0) {
            const placeholders = characterIds
                .map(() => "?")
                .join(", ");

            const publishedResult = db.characters.query(
                `
                    SELECT id
                    FROM published
                    WHERE id IN (${placeholders})
                `,
                characterIds
            );

            assertDbSuccess(publishedResult);

            publishedIds = new Set(
                publishedResult.rows.map(
                    (row) => row.id as string
                )
            );
        }

        const parsedItems = items.map((item) => ({
            ...item,
            isPublished: publishedIds.has(item.id)
        }));

        return res.status(200).json({
            ...characters,
            items: parsedItems,
            pages: Math.ceil(characters.count / parsedLimit)
        });

    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();

            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        }

        log.unknown.error(error).save();

        return res.status(500).json({
            message: i18n.t("responses.unknown")
        });
    }
};
