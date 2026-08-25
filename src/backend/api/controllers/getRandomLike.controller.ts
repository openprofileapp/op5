import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";
import { InteractionType } from "../../../_common/types/interaction.type.js";
import { db } from "../databases/db.js";
import { log } from "../instances.js";
import getPublishedCharactersById from "../services/getPublishedCharactersById.service.js";
import { i18n } from "../../_common/instances.js";

export const getRandomLike = (req: Request, res: Response) => {
    try {
        if (!req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.noAccount"),
            });
        }

        const result = db.interactions.query<InteractionType>(
            "SELECT * FROM likes WHERE source = ? ORDER BY RANDOM() LIMIT 1",
            [req.session.userId]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching likes",
                details: result.error
            })
        }

        if (result.rowCount < 1) return;

        const character = getPublishedCharactersById(result.rows[0].target)

        res.status(200).json(character);
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
