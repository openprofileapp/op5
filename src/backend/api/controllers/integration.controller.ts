import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";
import getUsersService from "../services/getUsers.service.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";

export const getIntegrationMetadataController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        await assertApiSecret(req);

        const user = getUsersService({ 
            idOrUsername: userId as string
        }).items[0]

        res.status(200).json({
            accountage: Math.floor((Date.now() - new Date(user.createdDate).getTime()) / (1000 * 60 * 60 * 24)),
            followercount: (user.interactions?.follows?.count || 0) + (user.statistics?.followers || 0),
            likecount: user.statistics?.likes || 0,
            readcount: user.statistics?.reads || 0,
            isverified: user.badges?.some((badge) => badge.type === "VERIFIED")
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
