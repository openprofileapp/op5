import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../../instances.js";
import { db } from "../../../databases/db.js";
import isBearerTokenAuthorized from "../../../../_common/helpers/isTokenOrSecretAuthorized.js";
import PlatformPermissionsService from "../../../../_common/services/platformPermissions.service.js";

export const deletePins = async (req: Request, res: Response) => {
    try {
        const { ownerId, assetId } = req.params;

        if (!req.session?.userId) {
            return res.status(403).json({ error: "No account" });
        }

        if (!ownerId || !assetId) {
            throw new AdvancedError({
                code: 400,
                message: "Malformed request"
            })
        }

        if (
            !await isBearerTokenAuthorized(req) || 
            req.session && !PlatformPermissionsService.can(
                req.session, 
                ["ADMIN"],
                assetId as string
            )
        ) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // when moving pins, raise all numbers by 1

        const result = db.pins.query(
            `
                DELETE FROM pins 
                WHERE ownerId = ? AND assetId = ?
            `,
            [ownerId, assetId]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while deleting pins",
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