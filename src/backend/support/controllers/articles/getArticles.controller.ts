import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { getArticleIndex } from "../../helpers/handleArticles.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";

export const getArticlesController = async (req: Request, res: Response) => {
    try {
        const articles = await getArticleIndex();

        return res.json(articles);
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
