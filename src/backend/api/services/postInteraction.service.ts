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

interface InteractionEventResult {
    newInteraction: boolean;
    count?: number;
}

async function postInteractionEvent(
    sourceId: string,
    targetId: string, 
    type: InteractionNameType,
    session?: ValidSessionType
): Promise<InteractionEventResult> {   
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
        );

        assertDbSuccess(result);

        if (result.changes === 0) {
            newInteraction = true;

            const result = q(
                `INSERT INTO ${type} (source, target) VALUES (?, ?)`,
                [sourceId, targetId]
            );

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

    const interactions = getInteractionsService({ target: targetId, type });
    const count = interactions[type]?.count;

    return { newInteraction, count };
}

async function postInteractionNotification(
    sourceId: string,
    targetId: string,
    type: InteractionNameType,
    eventData: InteractionEventResult
) {
    const { newInteraction, count } = eventData;

    let notificationType: NotificationNameType | undefined;

    switch (`${type}:${newInteraction}`) {
        case "follows:true":
            notificationType = "NEW_FOLLOW";
            break;
        case "likes:true":
            notificationType = "NEW_LIKE";
            break;
    }

    const whatIsData = whatIs(targetId);

    if (
        notificationType &&
        (sourceId !== whatIsData.ownerId || sourceId !== whatIsData.id)
    ) {
        await sendNotificationService(
            config.isProduction ? whatIsData.ownerId || whatIsData.id : sourceId,
            notificationType,
            { sourceId, targetId }
        );
    }

    const isMilestone = count ? notificationMilestones.includes(count) : false;

    if (isMilestone) {
        let milestoneType: NotificationNameType | undefined;

        switch(type) {
            case "follows":
                milestoneType = "FOLLOWS_MILESTONE";
                break;
            case "likes":
                milestoneType = "LIKES_MILESTONE";
                break;
            case "reads":
                milestoneType = "READS_MILESTONE";
                break;
            case "shares":
                milestoneType = "SHARES_MILESTONE";
                break;
            case "views":
                milestoneType = "VIEWS_MILESTONE";
                break;
        }

        if (milestoneType) {
            await sendNotificationService(
                sourceId,
                milestoneType,
                { targetId, count }
            );
        }
    }
}

export default async function postInteractionService(
    sourceId: string,
    targetId: string, 
    type: InteractionNameType,
    session?: ValidSessionType
): Promise<InteractionEventResult> {
    const result = await postInteractionEvent(sourceId, targetId, type, session);

    // Returns the result instantly and processes the notification in the background
    postInteractionNotification(
        sourceId, 
        targetId, 
        type, 
        result
    ).catch(err => {
        console.error("Failed to process postInteraction notification in background:", err);
    });

    return result;
}
