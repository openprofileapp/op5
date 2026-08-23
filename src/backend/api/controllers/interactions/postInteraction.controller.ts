import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { db } from "../../databases/db.js";
import isBearerTokenAuthorized from "../../../_common/helpers/isTokenOrSecretAuthorized.js";
import PlatformPermissionsService from "../../../_common/services/platformPermissions.service.js";
import { InteractionNameType } from "../../../../_common/types/interaction.type.js";
import { satisfiesAll } from "../../../_common/helpers/satisfiesAll.js";

type Props = {
    targetId: string, 
    type: InteractionNameType
}

export const postInteraction = async (req: Request, res: Response) => {
    try {
        if (!req.session?.userId) {
            throw new AdvancedError({
                code: 403,
                message: "No account"
            })
        }

        const { targetId, type }: Props = req.body;

        if (!targetId || !type) {
            throw new AdvancedError({
                code: 400,
                message: "Malformed request"
            })
        }

        const allowedTypes = satisfiesAll<InteractionNameType>()(
            "blocks",
            "chats",
            "dismisses",
            "follows",
            "friends",
            "hides",
            "hiddenCollaborations",
            "likes",
            "mutes",
            "mutes",
            "reads",
            "restricts",
            "shares",
            "views"
        );

        if (!allowedTypes.has(type)) {
            throw new AdvancedError({
                code: 400,
                message: `Invalid interaction type: ${type}`
            });
        }

        if (
            // DEVELOPER NEEDED: Once the token API is fixed, require both && over ||
            !await isBearerTokenAuthorized(req) || 
            !PlatformPermissionsService.has(
                req.session.permissions.value, 
                // DEVELOPER NEEDED: If view or read, switch to another, or use a permission type map
                ["USE_INTERACTIONS"]
            )

            // DEVELOPER NEEDED: Also to an assets permission check and interaction check to ensure the
            // interacting user isn't blocked or limited by the asset or owner.
        ) {
            throw new AdvancedError({
                code: 401,
                message: "Unauthorized"
            })
        }

        db.interactions.transaction(q => {
            const result = q(
                `DELETE FROM ${type} WHERE source = ? AND target = ?`,
                [req.session.userId, targetId]
            )

            if (!result.success) {
                throw new AdvancedError({
                    code: 500,
                    message: "An error occurred while deleting interaction",
                    details: result.error
                })
            }

            if (result.changes === 0) {
                const result = q(
                    `INSERT INTO ${type} (source, target) VALUES (?, ?)`,
                    [req.session.userId, targetId]
                )

                if (!result.success) {
                    throw new AdvancedError({
                        code: 500,
                        message: "An error occurred while saving interaction",
                        details: result.error
                    })
                }
            }
        });

        // DEVELOPER NEEDED: After interaction, send a notification and assign score + interests

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
