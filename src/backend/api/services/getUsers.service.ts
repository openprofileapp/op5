import { DateTime } from "luxon";

import { config } from "../../../../app.config.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { GetUserItemType, GetUserType } from "../../../_common/types/user.type.js";
import { GetFromType } from "../../../_common/types/getFrom.type.js";
import { SortByType } from "../../../_common/types/sortBy.type.js";
import { parseJson } from "../../_common/helpers/parseJson.js";
import { db } from "../databases/db.js";
import getInterestsService from "./getInterests.service.js";
import { InteractionNameType } from "../../../_common/types/interaction.type.js";
import AssetPermissionsService from "./assetPermissions.service.js";
import { UsernameType } from "../../../_common/types/username.type.js";
import ExperimentsService from "../../_common/services/experiments.service.js";

type Props = {
    idOrUsername?: string;
    query?: string;
    tag?: string;
    sortBy?: SortByType;
    offset?: number;
    limit?: number;
    getAs?: string;
    getFrom?: GetFromType;
    delegatedAccounts?: string[];
    includeInteractionItems?: boolean;
    internalPermissionsBypass?: boolean;
};

export default function getUsersService({
    idOrUsername,
    query,
    tag,
    sortBy,
    offset = 0,
    limit = config.limits.assetsPerPage,
    getAs,
    getFrom,
    delegatedAccounts,
    includeInteractionItems = false,
    internalPermissionsBypass = false
}: Props): GetUserType {    
    let interests;

    let id = idOrUsername;

    const idResult = db.users.query<UsernameType>(
        "SELECT * FROM usernames WHERE username = ? LIMIT 1",
        [idOrUsername]
    );

    assertDbSuccess(idResult);

    if (idResult.rowCount > 0) {
        id = idResult.rows[0].userId;
    }

    if (getAs) {
        interests = getInterestsService(getAs); 
    }

    const userInterestArray = interests?.items || [];

    const idClause = id ? "AND users.id = ?" : "";
    const idParams = id ? [id] : [];

    const verifiedClause = sortBy === "verified" ? "AND verifiedBadges.id IS NOT NULL" : "";

    const recentClause = sortBy === "recent" ? "AND users.updatedDate >= ?" : "";
    const recentParams = sortBy === "recent" ? [DateTime.now().minus({ days: 30 }).toISO()] : [];

    const trendingParams = sortBy === "trending" 
        ? Array(5).fill(DateTime.now().minus({ hours: 24 }).toISO()) 
        : [];

    const trendingJoin = sortBy === "trending" ? `
        LEFT JOIN (
            SELECT target, COUNT(*) AS recentActivityCount
            FROM (
                SELECT target, date FROM interactions.views
                UNION ALL
                SELECT target, date FROM interactions.shares
                UNION ALL
                SELECT target, date FROM interactions.reads
                UNION ALL
                SELECT target, date FROM interactions.likes
                UNION ALL
                SELECT target, date FROM interactions.follows
            ) recent_interactions
            WHERE date >= ? OR date >= ? OR date >= ? OR date >= ? OR date >= ?
            GROUP BY target
        ) trendingStats ON trendingStats.target = users.id
    ` : "";

    const trendingWhereClause = sortBy === "trending" ? "AND trendingStats.target IS NOT NULL" : "";

    const isHomePage = Boolean(getAs && getFrom === "home");

    // DEVELOPER NEEDED: If not added to any collection either
    const homeClause = isHomePage && sortBy !== "recent"
        ? `AND NOT EXISTS (
            SELECT 1 FROM interactions.dismisses WHERE target = users.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.likes WHERE target = users.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.reads WHERE target = users.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.follows WHERE target = users.id AND source = ?
        )`
        : "";

    const homeParams = isHomePage && sortBy !== "recent"
        ? [...Array(4).fill(getAs)]
        : [];

    const homeRecentClause = isHomePage && sortBy === "recent"
        ? `AND EXISTS (
            SELECT 1 FROM interactions.follows 
            WHERE target = users.id AND source = ?
        )
        AND NOT EXISTS (
            SELECT 1 FROM interactions.dismisses 
            WHERE target = users.id 
                AND source = ? 
                AND date > users.updatedDate
        )
        AND NOT EXISTS (
            SELECT 1 FROM interactions.views 
            WHERE target = users.id 
                AND source = ? 
                AND date > users.updatedDate
        )`
        : "";

    const homeRecentParams = isHomePage && sortBy === "recent"
        ? [...Array(3).fill(getAs)]
        : [];

    const trimmedQuery = query?.trim();
    const queryTerm = `%${trimmedQuery}%`;

    const queryClause = trimmedQuery 
        ? `AND (
            users.displayName LIKE ? 
            OR users.about LIKE ? 
            OR users.tags LIKE ?
            OR usernames.username LIKE ?
        )` 
        : "";

    const queryParams = trimmedQuery 
        ? [...Array(4).fill(queryTerm)] 
        : [];

    const trimmedTag = tag?.trim();
    
    const tagClause = trimmedTag ? "AND users.tags LIKE ?" : "";
    const tagParams = trimmedTag ? [`%"${trimmedTag}"%`] : [];

    let formattedSortBy: string;

    switch (sortBy) {
        case "trending":
            formattedSortBy = "trendingStats.recentActivityCount DESC, users.algorithmScore DESC";
            break;
        case "popularAsc":
            formattedSortBy = "users.algorithmScore ASC";
            break;
        case "recent":
            formattedSortBy = "users.updatedDate DESC";
            break;
        case "newest":
            formattedSortBy = "users.createdDate DESC";
            break;
        case "oldest":
            formattedSortBy = "users.createdDate ASC";
            break;
        case "nameAsc":
            formattedSortBy = "users.displayName ASC";
            break;
        case "nameDesc":
            formattedSortBy = "users.displayName DESC";
            break;
        default:
            formattedSortBy = "users.algorithmScore DESC";
    }

    const includeInterests = 
        (
            sortBy === "recommended" || 
            sortBy === "exclusive" ||
            sortBy === "verified"
        )
        && userInterestArray.length > 0;

    const orderClause = includeInterests
        ? `(${userInterestArray.map(
                () => "(CASE WHEN users.tags LIKE ? THEN ? ELSE 0 END)"
            ).join(" + ")}) DESC, ${formattedSortBy}`
        : formattedSortBy;

    const orderParams = includeInterests
        ? userInterestArray.flatMap(item => [
            `%${item.tag}%`, 
            item.algorithmScore
        ])
        : [];

    const visibilityParams = [];

    let visibilityCondition = "";

    const hasDelegatedAccounts = Array.isArray(delegatedAccounts) && delegatedAccounts.length > 0;

    let hasDirectViewPermission = false;
    
    if (getAs && id) {
        hasDirectViewPermission = AssetPermissionsService.can(getAs, "VIEW", id);
    }

    if (sortBy === "exclusive") {
        visibilityCondition = `(
            users.visibility NOT IN ('public', 'private', 'registered') AND (
                (users.visibility = 'friends' AND friendsOut.source IS NOT NULL AND friendsIn.source IS NOT NULL)
            )
        )`;
    } else {
        let isUnlistedAllowed = getFrom === "profile";

        if (internalPermissionsBypass) {
            hasDirectViewPermission = true;
            isUnlistedAllowed = true;
        }

        visibilityCondition = `(
            (users.visibility = 'public') OR
            (users.visibility = 'registered' AND ? IS NOT NULL) OR
            (users.visibility = 'friends' AND friendsOut.source IS NOT NULL AND friendsIn.source IS NOT NULL) OR
            (users.visibility = 'unlisted' AND (${isUnlistedAllowed ? '1 = 1' : 'users.id = ?'})) OR
            (
                users.visibility = 'private' AND 
                (
                    users.id = ? OR 
                    ${hasDirectViewPermission ? '1 = 1' : '1 = 0'} OR
                    ${hasDelegatedAccounts ? 'users.id IN (' + delegatedAccounts.map(() => '?').join(',') + ')' : '1 = 0'}
                )
            )
        )`;

        visibilityParams.push(getAs); 

        if (!isUnlistedAllowed) {
            visibilityParams.push(getAs);
        }

        visibilityParams.push(getAs);

        if (hasDelegatedAccounts) {
            visibilityParams.push(...delegatedAccounts);
        }
    }

    const interactionTables: InteractionNameType[] = [
        "follows", 
        "shares", 
        "views",
        "blocks",
        "restricts"
    ];

    const interactionParams: (string | undefined)[] = [];

    const buildInteractionField = (table: InteractionNameType) => {
        interactionParams.push(getAs, getAs, getAs, getAs);

        const items = includeInteractionItems 
            ? `'items', COALESCE((SELECT json_group_array(json_object('source', source, 'target', target, 'date', date)) FROM interactions.${table} WHERE target = users.id), json('[]')),` 
            : "";

        return `
            '${table}', json_object(
                ${items}
                'count', (SELECT COUNT(*) FROM interactions.${table} WHERE target = users.id),
                'hasInteracted', CASE WHEN ? IS NOT NULL AND EXISTS (SELECT 1 FROM interactions.${table} WHERE target = users.id AND source = ?) THEN json('true') ELSE json('false') END,
                'latestDate', CASE WHEN ? IS NOT NULL THEN (SELECT MAX(date) FROM interactions.${table} WHERE target = users.id AND source = ?) ELSE NULL END
            )
        `;
    };

    const interactionFieldsSql = interactionTables.map(buildInteractionField).join(",");

    const notificationsParams: (string | undefined)[] = [];

    const notificationsSelectSql = `
        json_object(
            'mute', (
                SELECT json_object(
                    'duration', nm.duration,
                    'isIndefinite', CASE WHEN nm.isIndefinite = 1 THEN json('true') ELSE json('false') END,
                    'date', nm.date
                )
                FROM notifications.mutes nm
                WHERE nm.target = users.id AND nm.source = ?
                LIMIT 1
            ),
            'subscriptions', (
                SELECT json_object(
                    'isSubscribedToContent', CASE WHEN ns.isSubscribedToContent = 1 THEN json('true') ELSE json('false') END,
                    'isSubscribedToCollaborationChanges', CASE WHEN ns.isSubscribedToCollaborationChanges = 1 THEN json('true') ELSE json('false') END,
                    'isSubscribedToNewComments', CASE WHEN ns.isSubscribedToNewComments = 1 THEN json('true') ELSE json('false') END,
                    'isSubscribedToNewInteractions', CASE WHEN ns.isSubscribedToNewInteractions = 1 THEN json('true') ELSE json('false') END,
                    'isSubscribedToNewMessages', CASE WHEN ns.isSubscribedToNewMessages = 1 THEN json('true') ELSE json('false') END
                )
                FROM notifications.subscriptions ns
                WHERE ns.target = users.id AND ns.source = ?
                LIMIT 1
            )
        ) AS notifications
    `;

    notificationsParams.push(getAs, getAs);

    const result = db.users.query(
        `
            SELECT 
                users.*,
                friendsOut.source AS isFriendOut,
                friendsIn.source AS isFriendIn,
                COALESCE(
                    (
                        SELECT json_group_array(
                            json_object(
                                'username', u.username,
                                'isPrimary', u.isPrimary
                            )
                        )
                        FROM usernames u
                        WHERE u.userId = users.id
                    ),
                    json('[]')
                ) AS usernames,
                COALESCE(
                    (
                        SELECT json_group_array(
                            json_object(
                                'type', b.type,
                                'comment', b.comment,
                                'visibility', b.visibility,
                                'date', b.date
                            )
                        )
                        FROM badges.badges b
                        WHERE b.id = users.id
                    ),
                    json('[]')
                ) AS badges,
                json_object(
                    ${interactionFieldsSql}
                ) AS interactions,
                ${notificationsSelectSql}
            FROM users
            LEFT JOIN usernames 
                ON usernames.userId = users.id 
                AND usernames.isPrimary = 1
            LEFT JOIN badges.badges verifiedBadges
                ON verifiedBadges.id = users.id
                AND verifiedBadges.type = 'VERIFIED'
            LEFT JOIN interactions.hides 
                ON hides.target = users.id 
                AND hides.source = ?
            LEFT JOIN interactions.follows 
                ON follows.target = users.id 
                AND follows.source = ?
            LEFT JOIN interactions.friends friendsOut
                ON friendsOut.source = ?
                AND friendsOut.target = users.id
            LEFT JOIN interactions.friends friendsIn
                ON friendsIn.source = users.id
                AND friendsIn.target = ?
            ${trendingJoin}
            WHERE hides.source IS NULL
                AND ${visibilityCondition}
                ${verifiedClause}
                ${recentClause}
                ${trendingWhereClause}
                ${homeClause}
                ${homeRecentClause}
                ${idClause}
                ${queryClause}
                ${tagClause}
            ORDER BY ${orderClause}
            LIMIT ? OFFSET ?
        `,
        [
            ...interactionParams,
            ...notificationsParams,
            ...Array(4).fill(getAs),
            ...trendingParams,
            ...visibilityParams,
            ...recentParams,
            ...homeParams,
            ...homeRecentParams,
            ...idParams,
            ...queryParams,
            ...tagParams,
            ...orderParams,
            limit,
            offset
        ]
    );

    assertDbSuccess(result);

    const countResult = db.users.query<{ total: number }>(
        `
            SELECT COUNT(*) as total
            FROM users
            LEFT JOIN usernames 
                ON usernames.userId = users.id 
                AND usernames.isPrimary = 1
            LEFT JOIN badges.badges verifiedBadges
                ON verifiedBadges.id = users.id
                AND verifiedBadges.type = 'VERIFIED'
            LEFT JOIN interactions.hides 
                ON hides.target = users.id 
                AND hides.source = ?
            LEFT JOIN interactions.follows 
                ON follows.target = users.id 
                AND follows.source = ?
            LEFT JOIN interactions.friends friendsOut
                ON friendsOut.source = ?
                AND friendsOut.target = users.id
            LEFT JOIN interactions.friends friendsIn
                ON friendsIn.source = users.id
                AND friendsIn.target = ?
            ${trendingJoin}
            WHERE hides.source IS NULL
                AND ${visibilityCondition}
                ${verifiedClause}
                ${recentClause}
                ${trendingWhereClause}
                ${homeClause}
                ${homeRecentClause}
                ${idClause}
                ${queryClause}
                ${tagClause}
        `,
        [
            ...Array(4).fill(getAs),
            ...trendingParams,
            ...visibilityParams,
            ...recentParams,
            ...homeParams,
            ...homeRecentParams,
            ...idParams,
            ...queryParams,
            ...tagParams
        ]
    );

    assertDbSuccess(countResult);

    const totalCount = countResult.rows[0]?.total || 0;

    const parsedRows = result.rows.map(row => {
        const isOwner = Boolean(getAs && row.id === getAs);
        const isMutualFriend = Boolean(row.isFriendOut && row.isFriendIn);
        const isDelegated = Boolean(hasDelegatedAccounts && delegatedAccounts.includes(row.id as string));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedRow: any = {
            ...row,
            usernames: parseJson(row.usernames),
            badges: parseJson(row.badges),
            tags: parseJson(row.tags),
            flags: ExperimentsService.decode(row.flags as string),
            interactions: parseJson(row.interactions),
            notifications: parseJson(row.notifications)
        };

        delete formattedRow.isFriendOut;
        delete formattedRow.isFriendIn;

        if (!internalPermissionsBypass) {
            if (!isOwner && formattedRow.interactions) {
                delete formattedRow.interactions.blocks;
                delete formattedRow.interactions.restricts;
            }

            const canViewField = (visibilitySetting?: string) => {
                if (!visibilitySetting || visibilitySetting === "public") return true;
                if (visibilitySetting === "registered" && getAs) return true;
                if (visibilitySetting === "friends" && isMutualFriend) return true;
                if (visibilitySetting === "private" && (isOwner || hasDirectViewPermission || isDelegated)) return true;
                return false;
            };

            if (!canViewField(formattedRow.birthdateVisibility)) {
                delete formattedRow.birthdate;
                delete formattedRow.birthdateVisibility;
            }

            if (!canViewField(formattedRow.presenceVisibility)) {
                delete formattedRow.presence;
                delete formattedRow.presenceVisibility;
            }

            if (!canViewField(formattedRow.foundedDateVisibility)) {
                delete formattedRow.foundedDate;
                delete formattedRow.foundedDateVisibility;
            }
        }

        return formattedRow as GetUserItemType;
    });

    return {
        items: parsedRows,
        count: totalCount
    };
}
