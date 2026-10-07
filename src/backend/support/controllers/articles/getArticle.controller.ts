import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { getArticle } from "../../helpers/handleArticles.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";

export const getArticleController = async (req: Request, res: Response) => {
    try {
        const slug = Array.isArray(req.params.slug)
            ? req.params.slug.join("/")
            : req.params.slug;

        const article = await getArticle(
            slug as string
        );

        if (!article) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.articleNotFound")
            });
        }

        return res.json(article);
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
