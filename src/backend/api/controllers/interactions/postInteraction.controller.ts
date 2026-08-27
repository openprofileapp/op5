import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { db } from "../../databases/db.js";
import { PlatformPermissionName } from "../../../_common/services/platformPermissions.service.js";
import { InteractionNameType } from "../../../../_common/types/interaction.type.js";
import { satisfiesAll } from "../../../_common/helpers/satisfiesAll.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { i18n } from "../../../_common/instances.js";
import sendNotificationService, { notificationMilestones } from "../../services/sendNotification.service.js";
import { NotificationNameType } from "../../../../_common/types/notification.type.js";
import getInteractionsService from "../../services/getInteractionsService.service.js";
import whatIs from "../../helpers/whatIs.js";

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

        const interactionPermissions: Record<InteractionNameType, PlatformPermissionName> = {
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

        const requiredPermission = interactionPermissions[type as InteractionNameType];

        assertPlatformPermissions(req.session, requiredPermission);

        db.interactions.transaction(q => {
            const result = q(
                `DELETE FROM ${type} WHERE source = ? AND target = ?`,
                [req.session.userId, targetId]
            )

            assertDbSuccess(result);

            if (result.changes === 0) {
                const result = q(
                    `INSERT INTO ${type} (source, target) VALUES (?, ?)`,
                    [req.session.userId, targetId]
                )

                assertDbSuccess(result);
            }
        });

        res.status(200).json({
            ok: true
        });

        const interactions = getInteractionsService({
            target: targetId,
            type,
            countOnly: true
        })

        let isMilestone = false;
        const count = interactions[type]?.count

        if (count && notificationMilestones.includes(count)) {
            isMilestone = true
        }

        let notificationType: NotificationNameType | undefined;

        switch(type) {
            case "follows":
                notificationType = "NEW_FOLLOW"
                break;
            case "likes":
                notificationType = "NEW_LIKE"
                break;
        }

        if (
            notificationType &&
            req.session.userId !== whatIs(targetId).ownerId
        ) {
            await sendNotificationService(
                req.session.userId,
                notificationType,
                {
                    sourceId: req.session.userId,
                    targetId
                }
            );
        }

        if (isMilestone) {
            switch(type) {
                case "follows":
                    notificationType = "FOLLOWS_MILESTONE"
                    break;
                case "likes":
                    notificationType = "LIKES_MILESTONE"
                    break;
                case "reads":
                    notificationType = "READS_MILESTONE"
                    break;
                case "shares":
                    notificationType = "SHARES_MILESTONE"
                    break;
                case "views":
                    notificationType = "VIEWS_MILESTONE"
                    break;
            }

            if (notificationType) {
                await sendNotificationService(
                    req.session.userId,
                    notificationType,
                    {
                        targetId,
                        count
                    }
                );
            }
        }

    // DEVELOPER NEEDED
    // Port scoreAssignmentService (w/ interests)
    // UPDATE MIGRATION TO USE THE NEW NOTIFICATION TYPE NAMES
    // sendPushNotificationService(); // should send for all delegated accounts
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
