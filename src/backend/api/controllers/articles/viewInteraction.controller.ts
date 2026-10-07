import type { Request, Response } from "express";
import { DateTime } from "luxon";

import { AdvancedError, parseDuration } from "kage-library";

import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";

type Props = {
    article: string
}

export const viewInteractionController = async (req: Request, res: Response) => {
    try {
        const { article }: Props = req.body;

        await assertBearer(req);
        assertNotNull(article);

        let viewCount = 0;
        let shouldInsert = true;

        db.articles.transaction(q => {
            let cooldown = "1h";

            if (!req.session?.userId) {
                cooldown = "24h";
            } 

            const result = q(
                `SELECT * FROM views 
                    WHERE userId = ? AND article = ? 
                    ORDER BY date DESC LIMIT 1`,
                [req.session?.userId || req.ip, article]
            );

            assertDbSuccess(result);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const latestDate = result.rows[0]?.date;

            if (latestDate) {
                const latestDateMs = DateTime.fromISO(latestDate).toMillis();
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const expiresAtMs = latestDateMs + parseDuration(cooldown);
                const nowMs = DateTime.now().toMillis();

                if (expiresAtMs > nowMs) {
                    shouldInsert = false;
                };
            }

            if (shouldInsert) {
                const insertResult = q(
                    `INSERT INTO views (userId, article) VALUES (?, ?)`,
                    [req.session?.userId || req.ip, article]
                );

                assertDbSuccess(insertResult);
            }

            const countResult = q(
                `SELECT 1 FROM views 
                    WHERE article = ?`,
                [article]
            );

            assertDbSuccess(countResult);

            viewCount = countResult.rowCount;
        })

        res.status(200).json({
            ok: true,
            viewCount
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
