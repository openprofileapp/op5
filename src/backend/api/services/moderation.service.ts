import whatIs from "./whatIs.service.js";
import { db } from "../databases/db.js";
import { PlatformPermissionNameType } from "../../../_common/types/permissions.type.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { ModerationActionType, ModerationReasonNameType, ModerationStatusType, ModerationType } from "../../../_common/types/moderation.type.js";
import { AssetNameType } from "../../../_common/types/asset.type.js";
import getModerationReason from "../../../_common/helpers/getModerationReason.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { snowflake, wc } from "../instances.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import sendNotificationService from "./sendNotification.service.js";

function getModerationAction(
    reason: ModerationReasonNameType,
    type: AssetNameType,
    offenceCount: number = 0
): ModerationActionType {
    const oneDay = 1000 * 60 * 60 * 24;
    const sixMonths = oneDay * 180;
    const reasonObject = getModerationReason(reason);
    const severity = reasonObject.severity

    let duration = 0;
    let revokePermissionsDuration = 0;
    let revokePermissions: PlatformPermissionNameType[] = [];
    const clampedOffenceCount = Math.max(1, offenceCount + 1);

    switch (severity) {
        case "MINOR":
            duration = sixMonths;
            break;
        case "MODERATE":
            duration = sixMonths * 2;
            break;
        case "SEVERE":
            duration = sixMonths * 3;
            break;
    }

    if (offenceCount !== 0) {
        switch (severity) {
            case "MINOR":
                revokePermissionsDuration = (oneDay * 1) * clampedOffenceCount;
                break;
            case "MODERATE":
                revokePermissionsDuration = (oneDay * 3) * clampedOffenceCount;
                break;
            case "SEVERE":
                revokePermissionsDuration = (oneDay * 5) * clampedOffenceCount;
                break;
        }

        switch (reason) {
            case "ABUSIVE_BEHAVIOR": {
                revokePermissions = [
                    "USE_SOCIAL_FEATURES"
                ];
                break;
            }

            case "SPAM_CONTENT": {
                revokePermissions = [
                    "CREATE_ASSETS",
                    "CREATE_BOTS"
                ];
                break;
            }

            case "MISSING_MATURE_WARNING":
            case "MISSING_SENSITIVE_WARNING": {
                revokePermissions = [
                    "CREATE_ASSETS"
                ];
                break;
            }

            case "PRIVACY_VIOLATION": {
                revokePermissions = [
                    "USE_SOCIAL_FEATURES",
                    "CREATE_ASSETS",
                    "WRITE"
                ];
                break;
            }

            case "AI_GENERATED_CONTENT": {
                revokePermissions = [
                    "CREATE_ASSETS",
                    "WRITE"
                ];
                break;
            }

            case "PLATFORM_MISUSE":
            case "PLATFORM_MANIPULATION":
            case "ILLEGAL_CONTENT":
            case "MALICIOUS_CONTENT":
            case "EXPLICIT_CONTENT":
            case "BAN_EVASION":
            case "IMPERSONATION": {
                revokePermissions = [
                    "WRITE",
                    "USE_INTERACTIONS",
                    "USE_SOCIAL_FEATURES",
                    "CREATE_REPORTS",
                    "CREATE_ASSETS",
                    "CREATE_BOTS",
                    "UPLOAD_MEMORIES",
                    "CASHOUT_REVENUE"
                ];
                break;
            }

            default: {
                revokePermissions = [];
                break;
            }
        }
    }

    switch (reason) {
        case "ABUSIVE_BEHAVIOR": {
            if (type === "USER") {
                return {
                    account: {
                        type: "warn",
                        duration,
                        revokePermissions,
                        revokePermissionsDuration
                    }
                }
            } else {
                return {
                    account: {
                        type: "warn",
                        duration,
                        revokePermissions,
                        revokePermissionsDuration
                    },
                    asset: {
                        visibility: "hide"
                    }
                }
            }
        }

        case "SPAM_CONTENT": {
            if (type === "USER") {
                return {
                    account: {
                        type: "warn",
                        duration,
                        visibility: "hide",
                        revokePermissions,
                        revokePermissionsDuration
                    }
                }
            } else {
                return {
                    account: {
                        type: "warn",
                        duration,
                        revokePermissions,
                        revokePermissionsDuration
                    },
                    asset: {
                        visibility: "hide"
                    }
                }
            }
        }

        case "MISSING_MATURE_WARNING": {
            if (type === "USER") {
                return {
                    account: {
                        type: "warn",
                        duration,
                        visibility: "add_mature_warning",
                        revokePermissions,
                        revokePermissionsDuration
                    }
                }
            } else {
                return {
                    account: {
                        type: "warn",
                        duration,
                        revokePermissions,
                        revokePermissionsDuration
                    },
                    asset: {
                        visibility: "add_mature_warning"
                    }
                }
            }
        }

        case "MISSING_SENSITIVE_WARNING": {
            if (type === "USER") {
                return {
                    account: {
                        type: "warn",
                        duration,
                        visibility: "add_sensitive_warning",
                        revokePermissions,
                        revokePermissionsDuration
                    }
                }
            } else {
                return {
                    account: {
                        type: "warn",
                        revokePermissions,
                        revokePermissionsDuration
                    },
                    asset: {
                        visibility: "add_sensitive_warning"
                    }
                }
            }
        }

        case "DMCA_TAKEDOWN": {
            if (type === "USER") {
                return {
                    account: {
                        type: "notice",
                        visibility: "hide"
                    }
                }
            } else {
                return {
                    account: {
                        type: "notice"
                    },
                    asset: {
                        visibility: "hide"
                    }
                }
            }
        }

        case "PRIVACY_VIOLATION": {
            if (type === "USER") {
                return {
                    account: {
                        type: "warn",
                        duration,
                        visibility: "hide",
                        revokePermissions,
                        revokePermissionsDuration
                    }
                }
            } else {
                return {
                    account: {
                        type: "warn",
                        duration,
                        revokePermissions,
                        revokePermissionsDuration
                    },
                    asset: {
                        visibility: "hide"
                    }
                }
            }
        }

        case "FILTER_BYPASS":
        case "AI_GENERATED_CONTENT": {
            if (type === "USER") {
                return {
                    account: {
                        type: "warn",
                        duration,
                        visibility: "hide",
                        revokePermissions,
                        revokePermissionsDuration
                    }
                }
            } else {
                return {
                    account: {
                        type: "warn",
                        duration,
                        revokePermissions,
                        revokePermissionsDuration
                    },
                    asset: {
                        visibility: "hide"
                    }
                }
            }
        }

        case "PLATFORM_MISUSE":
        case "PLATFORM_MANIPULATION":
        case "ILLEGAL_CONTENT":
        case "MALICIOUS_CONTENT":
        case "EXPLICIT_CONTENT":
        case "BAN_EVASION":
        case "IMPERSONATION": {
            return {
                account: {
                    type: "suspend",
                    duration,
                    revokePermissions,
                    revokePermissionsDuration
                },
                asset: {
                    visibility: "hide_all"
                }
            }
        }

        default: {
            return {};
        }
    }
}

/**
 * Handles moderation action on accounts and assets.
 */
export default class ModerationService {
    /**
     * Get all cases for a user with an optional status filter
     */
    public static getCases(
        targetId: string,
        status?: ModerationStatusType
    ) {
        assertNotNull(targetId);

        const target = whatIs(targetId);

        assertNotNull(target);

        const result = db.moderation.query<ModerationType>(
            `SELECT * FROM cases WHERE accountId = ? ${status ? "AND status = ?" : ""}`,
            status ? [targetId, status] : [targetId]
        );

        assertDbSuccess(result);

        return(result.rows)
    }

    /**
     * Create a new case using automatic punishment handling
     */
    public static async createCase(
        targetId: string,
        moderatorId: string,
        reason: ModerationReasonNameType,
        moderatorNote?: string,
    ) {
        assertNotNull([targetId, moderatorId, reason]);

        const target = whatIs(targetId);

        assertNotNull(target);

        const activeCases = this.getCases(
            target.ownerId ?? target.id,
            "ACTIVE"
        );

        const action = getModerationAction(
            reason as ModerationReasonNameType, 
            target.type, 
            activeCases.length
        );

        const result = db.moderation.query(
            `INSERT INTO cases (
                id, 
                accountId,
                assetId,
                action,
                accountVisibility,
                assetVisibility,
                type,
                moderatorNote,
                moderatorId,
                duration,
                revokedPermissions,
                revokedPermissionsDuration
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                snowflake.gen(),
                target.ownerId ?? target.id,
                target.id,
                action.account?.type,
                action.account?.visibility,
                action.asset?.visibility,
                reason,
                moderatorNote,
                moderatorId,
                action.account?.duration || 0,
                PlatformPermissionsService.encode(
                    action.account?.revokePermissions ?? []
                )?? '0',
                action.account?.revokePermissionsDuration || 0
            ]
        );

        assertDbSuccess(result);

        if (action.account?.revokePermissions?.length !== 0) {
            await wc.callAPI(
                `https://${config.domains.auth}/permissions/${target.ownerId ?? target.id}/remove`,
                {
                    method: "POST",
                    auth: `ApiSecret ${getEnv("API_SECRET")}`,
                    body: { permissions: action.account?.revokePermissions }
                }
            );
        }

        if (action.account?.type === "suspend") {
            await wc.callAPI(
                `https://${config.domains.auth}/moderation/suspend/${target.ownerId ?? target.id}`,
                { auth: `ApiSecret ${getEnv("API_SECRET")}` }
            );

            const userResult = db.users.query(
                "UPDATE users SET visibility = ? WHERE id = ? LIMIT 1",
                ["hidden", target.ownerId ?? target.id]
            );

            assertDbSuccess(userResult);

            const publishedChatactersResult = db.characters.query(
                "UPDATE published SET visibility = ? WHERE ownerId = ?",
                ["private", target.ownerId ?? target.id]
            );

            assertDbSuccess(publishedChatactersResult);

            const draftChatactersResult = db.characters.query(
                "UPDATE drafts SET visibility = ? WHERE ownerId = ?",
                ["private", target.ownerId ?? target.id]
            );

            assertDbSuccess(draftChatactersResult);
        }

        if (action.account?.visibility === "add_mature_warning") {
            const result = db.users.query(
                "UPDATE users SET isMature = ? WHERE id = ? LIMIT 1",
                [1, target.ownerId ?? target.id]
            );

            assertDbSuccess(result);
        }

        if (action.account?.visibility === "add_sensitive_warning") {
            const result = db.users.query(
                "UPDATE users SET isSensitive = ? WHERE id = ? LIMIT 1",
                [1, target.ownerId ?? target.id]
            );

            assertDbSuccess(result);
        }

        if (action.account?.visibility === "hide") {
            const result = db.users.query(
                "UPDATE users SET visibility = ? WHERE id = ? LIMIT 1",
                ["hidden", target.ownerId ?? target.id]
            );

            assertDbSuccess(result);
        }

        if (action.account?.visibility === "unhide") {
            const result = db.users.query(
                "UPDATE users SET visibility = ? WHERE id = ? LIMIT 1",
                ["private", target.ownerId ?? target.id]
            );

            assertDbSuccess(result);
        }

        if (action.asset?.visibility === "add_mature_warning") {
            const publishedResult = db.characters.query(
                "UPDATE published SET isMature = ? WHERE id = ? LIMIT 1",
                [1, target.id]
            );

            assertDbSuccess(publishedResult);

            const draftResult = db.characters.query(
                "UPDATE drafts SET isMature = ? WHERE id = ? LIMIT 1",
                [1, target.id]
            );

            assertDbSuccess(draftResult);
        }

        if (action.asset?.visibility === "add_sensitive_warning") {
            const publishedResult = db.characters.query(
                "UPDATE published SET isSensitive = ? WHERE id = ? LIMIT 1",
                [1, target.id]
            );

            assertDbSuccess(publishedResult);

            const draftResult = db.characters.query(
                "UPDATE drafts SET isSensitive = ? WHERE id = ? LIMIT 1",
                [1, target.id]
            );

            assertDbSuccess(draftResult);
        }

        if (action.asset?.visibility === "hide") {
            const publishedResult = db.characters.query(
                "UPDATE published SET visibility = ? WHERE id = ? LIMIT 1",
                ["hidden", target.id]
            );

            assertDbSuccess(publishedResult);

            const draftResult = db.characters.query(
                "UPDATE drafts SET visibility = ? WHERE id = ? LIMIT 1",
                ["hidden", target.id]
            );

            assertDbSuccess(draftResult);
        }

        if (action.asset?.visibility === "unhide") {
            const publishedResult = db.characters.query(
                "UPDATE published SET visibility = ? WHERE id = ? LIMIT 1",
                ["private", target.id]
            );

            assertDbSuccess(publishedResult);

            const draftResult = db.characters.query(
                "UPDATE drafts SET visibility = ? WHERE id = ? LIMIT 1",
                ["private", target.id]
            );

            assertDbSuccess(draftResult);
        }

        if (action.asset?.visibility === "hide_all") {
            const publishedResult = db.characters.query(
                "UPDATE published SET visibility = ? WHERE ownerId = ?",
                ["hidden", target.ownerId ?? target.id]
            );

            assertDbSuccess(publishedResult);

            const draftResult = db.characters.query(
                "UPDATE drafts SET visibility = ? WHERE ownerId = ?",
                ["hidden", target.ownerId ?? target.id]
            );

            assertDbSuccess(draftResult);
        }

        if (action.asset?.visibility === "unhide_all") {
            const publishedResult = db.characters.query(
                "UPDATE published SET visibility = ? WHERE ownerId = ? AND visibility = 'hidden'",
                ["private", target.ownerId ?? target.id]
            );

            assertDbSuccess(publishedResult);

            const draftResult = db.characters.query(
                "UPDATE drafts SET visibility = ? WHERE ownerId = ? AND visibility = 'hidden'",
                ["private", target.ownerId ?? target.id]
            );

            assertDbSuccess(draftResult);
        }

        sendNotificationService(
            target.ownerId ?? target.id,
            "NEW_MODERATION_CASE",
            { targetId: target.id, reason, note: moderatorNote }
        )

        await wc.callAPI(
            `https://${config.domains.discord_api}/v1/notifications/accounts/moderated`,
            {
                method: "POST",
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: { userId: moderatorId }
            }
        );
    }
}
