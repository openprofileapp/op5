import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";

type Props = {
    article: string;
    text: string;
}

export const feedbackInteractionController = async (req: Request, res: Response) => {
    try {
        const { article, text }: Props = req.body;

        await assertBearer(req);
        assertAccount(req.session);
        assertNotNull(article);
        assertPlatformPermissions(req.session, "CREATE_REPORTS");

        const result = db.articles.query(
            `INSERT INTO feedback (
                userId,
                article,
                text
            )
            VALUES (?, ?, ?)`,
            [
                req.session.userId,
                article,
                text,
            ]
        );

        assertDbSuccess(result);

        res.status(200).json({
            ok: true
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
