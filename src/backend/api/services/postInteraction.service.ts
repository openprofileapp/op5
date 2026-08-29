import { AdvancedError } from "kage-library";

import { InteractionNameType } from "../../../_common/types/interaction.type.js";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import { satisfiesAll } from "../../_common/helpers/satisfiesAll.js";
import { PlatformPermissionName } from "../../_common/services/platformPermissions.service.js";
import { assertPlatformPermissions } from "../../_common/asserts/platformPermissions.assert.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { AlgorithmEventNameType } from "../../../_common/types/algorithm.type.js";
import AlgorithmService from "./algorithm.service.js";
import getInteractionsService from "./getInteractions.service.js";
import sendNotificationService, { notificationMilestones } from "./sendNotification.service.js";
import { NotificationNameType } from "../../../_common/types/notification.type.js";
import whatIs from "../helpers/whatIs.js";
import { config } from "../../../../app.config.js";

export default async function postInteractionService(
    sourceId: string,
    targetId: string, 
    type: InteractionNameType,
    session?: ValidSessionType
) {   
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

    if (session) {
        assertPlatformPermissions(session, requiredPermission);
    }

    let newInteraction = false;

    db.interactions.transaction(q => {
        const result = q(
            `DELETE FROM ${type} WHERE source = ? AND target = ?`,
            [sourceId, targetId]
        )

        assertDbSuccess(result);

        if (result.changes === 0) {
            newInteraction = true;

            const result = q(
                `INSERT INTO ${type} (source, target) VALUES (?, ?)`,
                [sourceId, targetId]
            )

            assertDbSuccess(result);
        }
    });

    let algorithmEvent: AlgorithmEventNameType | undefined;

    // DEVELOPER NEEDED: Add collections, friend requests, and updates later
    if (sourceId) {
        switch (`${type}:${newInteraction}`) {
            case "views:true":
                algorithmEvent = "VIEW";
                break;
            case "reads:true":
                algorithmEvent = "READ";
                break;
            case "shares:true":
                algorithmEvent = "SHARE";
                break;
            case "follows:true":
                algorithmEvent = "FOLLOW";
                break;
            case "follows:false":
                algorithmEvent = "UNFOLLOW";
                break;
            case "likes:true":
                algorithmEvent = "LIKE";
                break;
            case "likes:false":
                algorithmEvent = "UNLIKE";
                break;
            case "hides:true":
                algorithmEvent = "HIDE";
                break;
            case "hides:false":
                algorithmEvent = "UNHIDE";
                break;
        }
    } else {
        switch (`${type}:${newInteraction}`) {
            case "views:true":
                algorithmEvent = "API";
                break;
            case "reads:true":
                algorithmEvent = "API";
                break;
            case "shares:true":
                algorithmEvent = "API";
                break;
        }
    }

    AlgorithmService.update(targetId, sourceId, algorithmEvent as AlgorithmEventNameType);

    const interactions = getInteractionsService({
        target: targetId,
        type
    })

    let isMilestone = false;
    const count = interactions[type]?.count

    if (count && notificationMilestones.includes(count)) {
        isMilestone = true
    }

    let notificationType: NotificationNameType | undefined;

    // DEVELOPER NEEDED: Add collections, friend requests, and updates later
    switch (`${type}:${newInteraction}`) {
        case "follows:true":
            notificationType = "NEW_FOLLOW";
            break;
        case "likes:true":
            notificationType = "NEW_LIKE";
            break;
    }

    if (!notificationType) return;

    const whatIsData = whatIs(targetId);

    if (
        notificationType &&
        (
            sourceId !== whatIsData.ownerId || 
            sourceId !== whatIsData.id
        )
    ) {
        await sendNotificationService(
            config.isProduction ? whatIsData.ownerId || whatIsData.id : sourceId,
            notificationType,
            {
                sourceId: sourceId,
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
                sourceId,
                notificationType,
                {
                    targetId,
                    count
                }
            );
        }
    }
}
