import { DateTime } from "luxon";

import { AdvancedError, parseDuration } from "kage-library";

import { InteractionNameType } from "../../../_common/types/interaction.type.js";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import { satisfiesAll } from "../../_common/helpers/satisfiesAll.js";
import { PlatformPermissionNameType } from "../../_common/services/platformPermissions.service.js";
import { assertPlatformPermissions } from "../../_common/asserts/platformPermissions.assert.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { AlgorithmEventNameType } from "../../../_common/types/algorithm.type.js";
import AlgorithmService, { index } from "./algorithm.service.js";
import getInteractionsService from "./getInteractions.service.js";
import sendNotificationService, { notificationMilestones } from "./sendNotification.service.js";
import { NotificationNameType } from "../../../_common/types/notification.type.js";
import whatIs from "../helpers/whatIs.js";
import { i18n } from "../../_common/instances.js";

type InteractionEventResult = {
    newInteraction: boolean;
    count?: number;
}

const interactionEventsIndex: Partial<Record<InteractionNameType, AlgorithmEventNameType>> = {
    chats: "CHAT",
    reads: "READ",
    shares: "SHARE",
    views: "VIEW"
};

async function postInteractionEvent(
    sourceId: string,
    targetId: string, 
    type: InteractionNameType,
    session?: ValidSessionType
): Promise<InteractionEventResult> {   
    if (targetId) {
        const whatIsData = whatIs(targetId);
        const isOwner = sourceId === whatIsData.ownerId || sourceId === whatIsData.id;

        if (isOwner) {
            if (type === "follows") {
                throw new AdvancedError({
                    code: 403,
                    message: i18n.t("responses.ownerInteraction.follow")
                });
            }
            
            if (type === "likes") {
                throw new AdvancedError({
                    code: 403,
                    message: i18n.t("responses.ownerInteraction.like")
                });
            }
        }
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

    const interactionPermissions: Record<InteractionNameType, PlatformPermissionNameType> = {
        blocks: "USE_INTERACTIONS",
        chats: "USE_INTERACTIONS",
        dismisses: "USE_INTERACTIONS",
        follows: "USE_INTERACTIONS",
        friends: "USE_SOCIAL_FEATURES",
        hides: "USE_INTERACTIONS",
        hiddenCollaborations: "USE_INTERACTIONS",
        likes: "USE_INTERACTIONS",
        reads: "READ",
        restricts: "USE_INTERACTIONS",
        shares: "USE_INTERACTIONS",
        views: "VIEW"
    };

    const requiredPermission = interactionPermissions[type];

    if (session) {
        assertPlatformPermissions(session, requiredPermission);
    }

    const eventKey = interactionEventsIndex[type];
    const eventConfig = index.events[eventKey || ""];
    let cooldown = eventConfig?.cooldown;

    let newInteraction = false;

    db.interactions.transaction(q => {
        const appendOnlyInteractions = 
            new Set([
                "views", 
                "reads", 
                "shares", 
                "chats"
            ]
        );
        
        const doNotDelete = appendOnlyInteractions.has(type);

        if (cooldown) {
            if (!session?.userId) {
                cooldown = "24h"
            } 

            const result = q(
                `SELECT * FROM ${type} 
                    WHERE source = ? AND target = ? 
                    ORDER BY date DESC LIMIT 1`,
                [sourceId, targetId]
            );

            assertDbSuccess(result);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const latestDate = result.rows[0]?.date;

            if (latestDate) {
                const latestDateMs = DateTime.fromISO(latestDate).toMillis();
                const expiresAtMs = latestDateMs + parseDuration(cooldown);
                const nowMs = DateTime.now().toMillis();

                if (expiresAtMs > nowMs) return;
            }
        }

        let deleteResult;

        if (!doNotDelete) {
            deleteResult = q(
                `DELETE FROM ${type} WHERE source = ? AND target = ?`,
                [sourceId, targetId]
            );

            assertDbSuccess(deleteResult);
        }

        if (doNotDelete || (deleteResult && deleteResult.changes === 0)) {
            newInteraction = true;

            const insertResult = q(
                `INSERT INTO ${type} (source, target) VALUES (?, ?)`,
                [sourceId, targetId]
            );

            assertDbSuccess(insertResult);
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

    if (algorithmEvent) {
        AlgorithmService.update(targetId, sourceId, algorithmEvent);
    }

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
        whatIsData &&
        (sourceId !== whatIsData.ownerId && sourceId !== whatIsData.id)
    ) {
        await sendNotificationService(
            whatIsData.ownerId || whatIsData.id,
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

        if (milestoneType && whatIsData) {
            await sendNotificationService(
                whatIsData.ownerId || whatIsData.id,
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
    const result = await postInteractionEvent(
        sourceId, 
        targetId, 
        type, 
        session
    );

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
