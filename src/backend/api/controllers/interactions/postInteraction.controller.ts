import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { db } from "../../databases/db.js";
import { PermissionName } from "../../../_common/services/platformPermissions.service.js";
import { InteractionNameType } from "../../../../_common/types/interaction.type.js";
import { satisfiesAll } from "../../../_common/helpers/satisfiesAll.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPermissions } from "../../../_common/asserts/permissions.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";

type Props = {
    targetId: string, 
    type: InteractionNameType
}

export const postInteraction = async (req: Request, res: Response) => {
    try {
        const { targetId, type }: Props = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertNotNull([targetId, type]);

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

        const interactionPermissionMap: Record<InteractionNameType, PermissionName> = {
            blocks: "USE_INTERACTIONS",
            chats: "USE_INTERACTIONS",
            dismisses: "USE_INTERACTIONS",
            follows: "USE_INTERACTIONS",
            friends: "USE_SOCIAL_FEATURES",
            hides: "USE_INTERACTIONS",
            hiddenCollaborations: "USE_INTERACTIONS",
            likes: "USE_INTERACTIONS",
            mutes: "USE_INTERACTIONS",
            reads: "READ",
            restricts: "USE_INTERACTIONS",
            shares: "USE_INTERACTIONS",
            views: "VIEW"
        };

        const requiredPermission = interactionPermissionMap[type as InteractionNameType];

        assertPermissions(req.session, requiredPermission);

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
