import type { Request, Response } from "express";

import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../_common/asserts/platformPermissions.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { AdvancedError } from "kage-library";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../databases/db.js";

export const getStatisticsController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as unknown as { id: string };

        await assertBearer(req); 
        assertPlatformPermissions(req.session, "VIEW");
        assertNotNull(id);

        const userResult = db.interactions.query(
            `SELECT 
                (SELECT COUNT(*) FROM follows WHERE source = ?) AS following,
                (SELECT COUNT(*) FROM follows WHERE target = ?) AS followers,
                (SELECT COUNT(*) FROM shares WHERE target = ?) AS shares,
                (SELECT COUNT(*) FROM views WHERE target = ?) AS views`,
            [...Array(4).fill(id)]
        );

        assertDbSuccess(userResult);

        const characterIdsResult = db.characters.query(
            "SELECT id FROM published WHERE ownerId = ?", 
            [id]
        );

        assertDbSuccess(characterIdsResult);

        const characterIds = 
            (characterIdsResult.rows as { id: string }[]).map(c => c.id);

        let contentResult;

        if (characterIds.length !== 0) {
            const placeholders = characterIds.map(() => "?").join(",");

            contentResult = db.interactions.query(
                `SELECT 
                    (SELECT COUNT(*) FROM follows WHERE target IN (${placeholders})) AS followers,
                    (SELECT COUNT(*) FROM likes WHERE target IN (${placeholders})) AS likes,
                    (SELECT COUNT(*) FROM reads WHERE target IN (${placeholders})) AS reads,
                    (SELECT COUNT(*) FROM shares WHERE target IN (${placeholders})) AS shares,
                    (SELECT COUNT(*) FROM views WHERE target IN (${placeholders})) AS views`,
                Array(5).fill(characterIds).flat()
            );

            assertDbSuccess(contentResult);
        }

        res.status(200).json({
            user: {
                following: userResult.rows[0].following || 0,
                followers: userResult.rows[0].followers || 0,
                shares: userResult.rows[0].shares || 0,
                views: userResult.rows[0].views || 0
            },
            content: {
                followers: contentResult?.rows[0].followers || 0,
                likes: contentResult?.rows[0].likes || 0,
                reads: contentResult?.rows[0].reads || 0,
                shares: contentResult?.rows[0].shares || 0,
                views: contentResult?.rows[0].views || 0
            }
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
