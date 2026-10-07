import type { Request, Response } from "express";
import { DateTime } from "luxon";

import { AdvancedError } from "kage-library";

import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";

type Props = {
    article: string;
    isHelpful: number;
    action: "GET" | "POST";
}

export const voteInteractionController = async (req: Request, res: Response) => {
    try {
        const { article, isHelpful, action }: Props = req.body;

        await assertBearer(req);
        assertAccount(req.session);
        assertNotNull(article);

        const preExistingResult = db.articles.query(
            "SELECT * FROM votes WHERE userId = ? AND article = ? LIMIT 1",
            [req.session.userId, article]
        );

        assertDbSuccess(preExistingResult);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const preExistingVote = preExistingResult.rows[0];

        if (action === "POST") {
            if (!preExistingVote) {
                const result = db.articles.query(
                    `INSERT INTO votes (
                        userId,
                        article,
                        isHelpful
                    )
                    VALUES (?, ?, ?)`,
                    [
                        req.session.userId,
                        article,
                        isHelpful,
                    ]
                );

                assertDbSuccess(result);
            } else if (preExistingVote.isHelpful === isHelpful) {
                const result = db.articles.query(
                    `DELETE FROM votes
                    WHERE userId = ?
                    AND article = ? 
                    LIMIT 1`,
                    [req.session.userId, article]
                );

                assertDbSuccess(result);
            } else {
                const result = db.articles.query(
                    `UPDATE votes
                    SET isHelpful = ?, date = ?
                    WHERE userId = ?
                    AND article = ? 
                    LIMIT 1`,
                    [
                        isHelpful,
                        DateTime.now().toUTC().toString(),
                        req.session.userId,
                        article,
                    ]
                );

                assertDbSuccess(result);
            }
        }

        const postSelfExistingResult = db.articles.query(
            "SELECT * FROM votes WHERE userId = ? AND article = ? LIMIT 1",
            [req.session.userId, article]
        );

        assertDbSuccess(postSelfExistingResult);

        const postTotalExistingResult = db.articles.query(
            "SELECT * FROM votes WHERE article = ? AND isHelpful = 1",
            [article]
        );

        assertDbSuccess(postTotalExistingResult);

        res.status(200).json({
            ok: true,
            isHelpful: postSelfExistingResult?.rows?.[0]?.isHelpful ?? null,
            totalHelpful: postTotalExistingResult.rowCount
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
