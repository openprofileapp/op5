import { DateTime } from "luxon";

import { config } from "../../../../app.config.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { GetDraftCharacterItemType, GetDraftCharacterType } from "../../../_common/types/character.type.js";
import { SortByType } from "../../../_common/types/sortBy.type.js";
import { parseJson } from "../../_common/helpers/parseJson.js";
import { db } from "../databases/db.js";
import getInterestsService from "./getInterests.service.js";
import { InteractionNameType } from "../../../_common/types/interaction.type.js";
import AssetPermissionsService from "./assetPermissions.service.js";

type Props = {
    id?: string;
    ownerId?: string;
    query?: string;
    tag?: string;
    sortBy?: SortByType;
    offset?: number;
    limit?: number;
    getAs?: string;
    includeInteractionItems?: boolean;
    includeMedia?: boolean;
    isTrash?: boolean;
    internalPermissionsBypass?: boolean;
};

export default function getDraftCharactersService({
    id,
    ownerId,
    query,
    tag,
    sortBy,
    offset = 0,
    limit = config.limits.assetsPerPage,
    getAs,
    includeInteractionItems = false,
    includeMedia = false,
    isTrash = false,
    internalPermissionsBypass = false
}: Props): GetDraftCharacterType {    
    let interests;

    if (getAs) {
        interests = getInterestsService(getAs); 
    }

    const userInterestArray = interests?.items || [];

    const isTrashClause = isTrash ? "AND drafts.isDeleted = 1" : "AND (drafts.isDeleted = 0 OR drafts.isDeleted IS NULL)";

    const idClause = id ? "AND drafts.id = ?" : "";
    const idParams = id ? [id] : [];

    const ownerIdClause = ownerId ? "AND drafts.ownerId = ?" : "";
    const ownerIdParams = ownerId ? [ownerId] : [];

    const verifiedClause = sortBy === "verified" ? "AND verifiedBadges.id IS NOT NULL" : "";

    const recentClause = sortBy === "recent" ? "AND drafts.updatedDate >= ?" : "";
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
        ) trendingStats ON trendingStats.target = drafts.id
    ` : "";

    const trendingWhereClause = sortBy === "trending" ? "AND trendingStats.target IS NOT NULL" : "";

    const trimmedQuery = query?.trim();
    const queryTerm = `%${trimmedQuery}%`;

    const queryClause = trimmedQuery 
        ? `AND (
            drafts.displayName LIKE ? 
            OR drafts.about LIKE ? 
            OR drafts.tags LIKE ?
            OR users.displayName LIKE ?
            OR usernames.username LIKE ?
        )` 
        : "";

    const queryParams = trimmedQuery 
        ? [...Array(5).fill(queryTerm)] 
        : [];

    const trimmedTag = tag?.trim();
    
    const tagClause = trimmedTag ? "AND drafts.tags LIKE ?" : "";
    const tagParams = trimmedTag ? [`%"${trimmedTag}"%`] : [];

    let formattedSortBy: string;

    switch (sortBy) {
        case "trending":
            formattedSortBy = "trendingStats.recentActivityCount DESC, drafts.algorithmScore DESC";
            break;
        case "popularAsc":
            formattedSortBy = "drafts.algorithmScore ASC";
            break;
        case "recent":
            formattedSortBy = "drafts.updatedDate DESC";
            break;
        case "newest":
            formattedSortBy = "drafts.createdDate DESC";
            break;
        case "oldest":
            formattedSortBy = "drafts.createdDate ASC";
            break;
        case "nameAsc":
            formattedSortBy = "drafts.displayName ASC";
            break;
        case "nameDesc":
            formattedSortBy = "drafts.displayName DESC";
            break;
        default:
            formattedSortBy = "drafts.algorithmScore DESC";
    }

    const includeInterests = 
        (
            sortBy === "recommended" || 
            sortBy === "limited" ||
            sortBy === "verified"
        )
        && userInterestArray.length > 0;

    const orderClause = includeInterests
        ? `(${userInterestArray.map(
                () => "(CASE WHEN drafts.tags LIKE ? THEN ? ELSE 0 END)"
            ).join(" + ")}) DESC, ${formattedSortBy}`
        : formattedSortBy;

    const orderParams = includeInterests
        ? userInterestArray.flatMap(item => [
            `%${item.tag}%`, 
            item.algorithmScore
        ])
        : [];

    let hasDirectViewPermission = false;
    
    if (getAs && id) {
        hasDirectViewPermission = AssetPermissionsService.can(getAs, "VIEW", id);
    }

    if (internalPermissionsBypass) {
        hasDirectViewPermission = true;
    }

    // Access restricted strictly to: owner OR explicit view permission/bypass
    const visibilityCondition = `(
        drafts.ownerId = ? OR 
        ${hasDirectViewPermission ? '1 = 1' : '1 = 0'}
    )`;

    const visibilityParams: (string | undefined)[] = [getAs];

    const interactionTables: InteractionNameType[] = [
        "follows",
        "likes",
        "reads",
        "shares",
        "views"
    ];

    const interactionParams: (string | undefined)[] = [];

    const buildInteractionField = (table: string) => {
        interactionParams.push(getAs, getAs, getAs, getAs);

        const items = includeInteractionItems 
            ? `'items', COALESCE((SELECT json_group_array(json_object('source', source, 'target', target, 'date', date)) FROM interactions.${table} WHERE target = drafts.id), json('[]')),` 
            : "";

        return `
            '${table}', json_object(
                ${items}
                'count', (SELECT COUNT(*) FROM interactions.${table} WHERE target = drafts.id),
                'hasInteracted', CASE WHEN ? IS NOT NULL AND EXISTS (SELECT 1 FROM interactions.${table} WHERE target = drafts.id AND source = ?) THEN json('true') ELSE json('false') END,
                'latestDate', CASE WHEN ? IS NOT NULL THEN (SELECT MAX(date) FROM interactions.${table} WHERE target = drafts.id AND source = ?) ELSE NULL END
            )
        `;
    };

    const interactionFieldsSql = interactionTables.map(buildInteractionField).join(",");

    const checkCollectionClause = getAs
        ? `EXISTS (
            SELECT 1 
            FROM collections.items 
            JOIN collections.collections 
                ON collections.collections.id = collections.items.collectionId 
            WHERE collections.collections.ownerId = ? 
                AND collections.items.assetId = drafts.id
        ) AS isCharacterInAnyCollections,`
        : "";

    const checkCollectionParams = getAs ? [getAs] : [];

    const mediaSelectSql = includeMedia 
        ? `
            COALESCE(
                (
                    SELECT json_group_array(
                        json_object(
                            'url', m.url,
                            'description', m.description,
                            'credit', m.credit,
                            'position', m.position,
                            'visibility', m.visibility,
                            'addedBy', m.addedBy,
                            'addedDate', m.addedDate
                        )
                    )
                    FROM media.drafts m
                    WHERE m.assetId = drafts.id
                ),
                json('[]')
            ) AS media
        ` 
        : "NULL AS media";

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
                WHERE nm.target = drafts.id AND nm.source = ?
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
                WHERE ns.target = drafts.id AND ns.source = ?
                LIMIT 1
            )
        ) AS notifications
    `;

    notificationsParams.push(getAs, getAs);

    const result = db.characters.query(
        `
            SELECT 
                drafts.*,
                ${checkCollectionClause}
                json_object(
                    'id', users.id,
                    'username', usernames.username,
                    'displayName', users.displayName,
                    'type', users.type,
                    'badges', COALESCE(
                        (
                            SELECT json_group_array(
                                json_object(
                                    'type', ob.type,
                                    'comment', ob.comment,
                                    'visibility', ob.visibility,
                                    'date', ob.date
                                )
                            )
                            FROM badges.badges ob
                            WHERE ob.id = users.id
                        ),
                        json('[]')
                    )
                ) AS owner,
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
                        WHERE b.id = drafts.id
                    ),
                    json('[]')
                ) AS badges,
                json_object(
                    ${interactionFieldsSql}
                ) AS interactions,
                ${mediaSelectSql},
                ${notificationsSelectSql}
            FROM main.drafts
            LEFT JOIN users.users 
                ON users.id = drafts.ownerId
            LEFT JOIN users.usernames 
                ON usernames.userId = users.id 
                AND usernames.isPrimary = 1
            LEFT JOIN badges.badges verifiedBadges
                ON verifiedBadges.id = users.id
                AND verifiedBadges.type = 'VERIFIED'
            LEFT JOIN interactions.hides 
                ON hides.target = drafts.id 
                AND hides.source = ?
            LEFT JOIN interactions.follows 
                ON follows.target = drafts.ownerId 
                AND follows.source = ?
            LEFT JOIN interactions.friends friendsOut
                ON friendsOut.source = ?
                AND friendsOut.target = drafts.ownerId
            LEFT JOIN interactions.friends friendsIn
                ON friendsIn.source = drafts.ownerId
                AND friendsIn.target = ?
            ${trendingJoin}
            WHERE hides.source IS NULL
                AND ${visibilityCondition}
                ${isTrashClause}
                ${verifiedClause}
                ${recentClause}
                ${trendingWhereClause}
                ${idClause}
                ${ownerIdClause}
                ${queryClause}
                ${tagClause}
            ORDER BY ${orderClause}
            LIMIT ? OFFSET ?
        `,
        [
            ...checkCollectionParams,
            ...interactionParams,
            ...notificationsParams,
            ...Array(4).fill(getAs),
            ...trendingParams,
            ...visibilityParams,
            ...recentParams,
            ...idParams,
            ...ownerIdParams,
            ...queryParams,
            ...tagParams,
            ...orderParams,
            limit,
            offset
        ]
    );

    assertDbSuccess(result);

    const countResult = db.characters.query<{ total: number }>(
        `
            SELECT COUNT(*) as total
            FROM main.drafts
            LEFT JOIN users.users 
                ON users.id = drafts.ownerId
            LEFT JOIN users.usernames 
                ON usernames.userId = users.id 
                AND usernames.isPrimary = 1
            LEFT JOIN badges.badges verifiedBadges
                ON verifiedBadges.id = users.id
                AND verifiedBadges.type = 'VERIFIED'
            LEFT JOIN interactions.hides 
                ON hides.target = drafts.id 
                AND hides.source = ?
            LEFT JOIN interactions.follows 
                ON follows.target = drafts.ownerId 
                AND follows.source = ?
            LEFT JOIN interactions.friends friendsOut
                ON friendsOut.source = ?
                AND friendsOut.target = drafts.ownerId
            LEFT JOIN interactions.friends friendsIn
                ON friendsIn.source = drafts.ownerId
                AND friendsIn.target = ?
            ${trendingJoin}
            WHERE hides.source IS NULL
                AND ${visibilityCondition}
                ${isTrashClause}
                ${verifiedClause}
                ${recentClause}
                ${trendingWhereClause}
                ${idClause}
                ${ownerIdClause}
                ${queryClause}
                ${tagClause}
        `,
        [
            ...Array(4).fill(getAs),
            ...trendingParams,
            ...visibilityParams,
            ...recentParams,
            ...idParams,
            ...ownerIdParams,
            ...queryParams,
            ...tagParams
        ]
    );

    assertDbSuccess(countResult);

    const totalCount = countResult.rows[0]?.total || 0;

    const parsedRows = result.rows.map(row => {
        delete row.ownerId;

        const owner = parseJson(row.owner);

        if (owner && typeof owner.badges === "string") {
            owner.badges = parseJson(owner.badges);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedRow: any = {
            ...row,
            owner,
            badges: parseJson(row.badges),
            tags: parseJson(row.tags),
            interactions: parseJson(row.interactions),
            notifications: parseJson(row.notifications),
            ...(getAs !== undefined && { isCharacterInAnyCollections: Boolean(row.isCharacterInAnyCollections) })
        };

        if (includeMedia) {
            formattedRow.media = parseJson(row.media) || [];
        } else {
            delete formattedRow.media;
        }

        return formattedRow as GetDraftCharacterItemType;
    });

    return {
        items: parsedRows,
        count: totalCount
    };
}
