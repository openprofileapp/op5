import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { getLatestChangelog } from "../../helpers/handleArticles.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";

export const getImportantChangesController = async (req: Request, res: Response) => {
    try {
        const article = await getLatestChangelog();

        // DEVELOPER NEEDED: Add ToS and Privacy Policy at a later time

        if (!article) {
            return res.status(404).json({
                error: "No changelog found",
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
