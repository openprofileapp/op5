import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../../instances.js";
import { db } from "../../../databases/db.js";
import isBearerTokenAuthorized from "../../../../_common/helpers/isBearerTokenAuthorized.js";

export const postPins = async (req: Request, res: Response) => {
    try {
        const { ownerId } = req.params;
        const { assetId, position } = req.body;

        if (!req.session?.userId) {
            return res.status(403).json({ error: "No account" });
        }

        if (!ownerId || !assetId || !position) {
            throw new AdvancedError({
                code: 400,
                message: "Malformed request"
            })
        }

        if (!await isBearerTokenAuthorized(req.headers.authorization)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check (isActionAuthorized(ownerId, assetId, ["pin"])) by checking aganist req.session, permissions, and more

        const result = db.pins.query(
            `
                INSERT INTO pins (ownerId, assetId, position)
                VALUES (?, ?, ?)
                ON CONFLICT(ownerId, assetId)
                DO UPDATE SET
                    position = excluded.position
            `,
            [ownerId, assetId, position]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while updating pins",
                details: result.error
            })
        }

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
        }
    }
};