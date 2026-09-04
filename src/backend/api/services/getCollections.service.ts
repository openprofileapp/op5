import { DateTime } from "luxon";

import { config } from "../../../../app.config.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { CollectionItemType, GetCollectionItemType, GetCollectionType } from "../../../_common/types/collection.type.js";
import { GetFromType } from "../../../_common/types/getFrom.type.js";
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
    getFrom?: GetFromType;
    delegatedAccounts?: string[];
    includeInteractionItems?: boolean;
    includeCollectionItems?: boolean;
    internalPermissionsBypass?: boolean;
};

export default function getCollectionsService({
    id,
    ownerId,
    query,
    tag,
    sortBy,
    offset = 0,
    limit = config.limits.assetsPerPage,
    getAs,
    getFrom,
    delegatedAccounts,
    includeInteractionItems = false,
    includeCollectionItems = false,
    internalPermissionsBypass = false
}: Props): GetCollectionType {    
    let interests;

    if (getAs) {
        interests = getInterestsService(getAs); 
    }

    const userInterestArray = interests?.items || [];

    const idClause = id ? "AND collections.id = ?" : "";
    const idParams = id ? [id] : [];

    const ownerIdClause = ownerId ? "AND collections.ownerId = ?" : "";
    const ownerIdParams = ownerId ? [ownerId] : [];

    const verifiedClause = sortBy === "verified" ? "AND verifiedBadges.id IS NOT NULL" : "";

    const recentClause = sortBy === "recent" ? "AND collections.updatedDate >= ?" : "";
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
        ) trendingStats ON trendingStats.target = collections.id
    ` : "";

    const trendingWhereClause = sortBy === "trending" ? "AND trendingStats.target IS NOT NULL" : "";

    const isHomePage = Boolean(getAs && getFrom === "home");

    const homeClause = isHomePage && sortBy !== "recent"
        ? `AND NOT EXISTS (
            SELECT 1 FROM interactions.dismisses WHERE target = collections.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.likes WHERE target = collections.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.reads WHERE target = collections.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.follows WHERE (target = collections.id OR target = collections.ownerId) AND source = ?
        )`
        : "";

    const homeParams = isHomePage && sortBy !== "recent"
        ? [...Array(4).fill(getAs)]
        : [];

    const homeRecentClause = isHomePage && sortBy === "recent"
        ? `AND EXISTS (
            SELECT 1 FROM interactions.follows 
            WHERE target = collections.id AND source = ?
        )
        AND NOT EXISTS (
            SELECT 1 FROM interactions.dismisses 
            WHERE target = collections.id 
                AND source = ? 
                AND date > collections.updatedDate
        )
        AND NOT EXISTS (
            SELECT 1 FROM interactions.views 
            WHERE target = collections.id 
                AND source = ? 
                AND date > collections.updatedDate
        )`
        : "";

    const homeRecentParams = isHomePage && sortBy === "recent"
        ? [...Array(3).fill(getAs)]
        : [];

    const trimmedQuery = query?.trim();
    const queryTerm = `%${trimmedQuery}%`;

    const queryClause = trimmedQuery 
        ? `AND (
            collections.displayName LIKE ? 
            OR collections.about LIKE ? 
            OR collections.tags LIKE ?
            OR users.displayName LIKE ?
            OR usernames.username LIKE ?
        )` 
        : "";

    const queryParams = trimmedQuery 
        ? [...Array(5).fill(queryTerm)] 
        : [];

    const trimmedTag = tag?.trim();
    
    const tagClause = trimmedTag ? "AND collections.tags LIKE ?" : "";
    const tagParams = trimmedTag ? [`%"${trimmedTag}"%`] : [];

    let formattedSortBy: string;

    switch (sortBy) {
        case "trending":
            formattedSortBy = "trendingStats.recentActivityCount DESC, collections.algorithmScore DESC";
            break;
        case "popularAsc":
            formattedSortBy = "collections.algorithmScore ASC";
            break;
        case "recent":
            formattedSortBy = "collections.updatedDate DESC";
            break;
        case "newest":
            formattedSortBy = "collections.createdDate DESC";
            break;
        case "oldest":
            formattedSortBy = "collections.createdDate ASC";
            break;
        case "nameAsc":
            formattedSortBy = "collections.displayName ASC";
            break;
        case "nameDesc":
            formattedSortBy = "collections.displayName DESC";
            break;
        default:
            formattedSortBy = "collections.algorithmScore DESC";
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
                () => "(CASE WHEN collections.tags LIKE ? THEN ? ELSE 0 END)"
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

    if (sortBy === "exclusive") {
        visibilityCondition = `(
            collections.visibility NOT IN ('public', 'private', 'registered') AND (
                (collections.visibility = 'followers' AND follows.source IS NOT NULL) OR
                (collections.visibility = 'friends' AND friendsOut.source IS NOT NULL AND friendsIn.source IS NOT NULL)
            )
        )`;
    } else {
        const hasDelegatedAccounts = Array.isArray(delegatedAccounts) && delegatedAccounts.length > 0;

        let hasDirectViewPermission = false;
        
        if (getAs && id) {
            hasDirectViewPermission = AssetPermissionsService.can(getAs, "VIEW", id);
        }

        let isUnlistedAllowed = getFrom === "profile";

        if (internalPermissionsBypass) {
            hasDirectViewPermission = true;
            isUnlistedAllowed = true;
        }

        visibilityCondition = `(
            (collections.visibility = 'public') OR
            (collections.visibility = 'registered' AND ? IS NOT NULL) OR
            (collections.visibility = 'followers' AND follows.source IS NOT NULL) OR
            (collections.visibility = 'friends' AND friendsOut.source IS NOT NULL AND friendsIn.source IS NOT NULL) OR
            (collections.visibility = 'unlisted' AND (${isUnlistedAllowed ? '1 = 1' : 'collections.ownerId = ?'})) OR
            (
                collections.visibility = 'private' AND 
                (
                    collections.ownerId = ? OR 
                    ${hasDirectViewPermission ? '1 = 1' : '1 = 0'} OR
                    ${hasDelegatedAccounts ? 'collections.ownerId IN (' + delegatedAccounts.map(() => '?').join(',') + ')' : '1 = 0'}
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
        "likes", 
        "mutes", 
        "reads", 
        "shares",
        "views"
    ];

    const interactionParams: (string | undefined)[] = [];

    const buildInteractionField = (table: string) => {
        interactionParams.push(getAs, getAs, getAs, getAs);

        const items = includeInteractionItems 
            ? `'items', COALESCE((SELECT json_group_array(json_object('source', source, 'target', target, 'date', date)) FROM interactions.${table} WHERE target = collections.id), json('[]')),` 
            : "";

        return `
            '${table}', json_object(
                ${items}
                'count', (SELECT COUNT(*) FROM interactions.${table} WHERE target = collections.id),
                'hasInteracted', CASE WHEN ? IS NOT NULL AND EXISTS (SELECT 1 FROM interactions.${table} WHERE target = collections.id AND source = ?) THEN json('true') ELSE json('false') END,
                'latestDate', CASE WHEN ? IS NOT NULL THEN (SELECT MAX(date) FROM interactions.${table} WHERE target = collections.id AND source = ?) ELSE NULL END
            )
        `;
    };

    const interactionFieldsSql = interactionTables.map(buildInteractionField).join(",");

    const result = db.collections.query(
        `
            SELECT 
                collections.*,
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
                        WHERE b.id = collections.id
                    ),
                    json('[]')
                ) AS badges,
                json_object(
                    ${interactionFieldsSql}
                ) AS interactions
            FROM main.collections
            LEFT JOIN users.users 
                ON users.id = collections.ownerId
            LEFT JOIN users.usernames 
                ON usernames.userId = users.id 
                AND usernames.isPrimary = 1
            LEFT JOIN badges.badges verifiedBadges
                ON verifiedBadges.id = users.id
                AND verifiedBadges.type = 'VERIFIED'
            LEFT JOIN interactions.hides 
                ON hides.target = collections.id 
                AND hides.source = ?
            LEFT JOIN interactions.follows 
                ON follows.target = collections.ownerId 
                AND follows.source = ?
            LEFT JOIN interactions.friends friendsOut
                ON friendsOut.source = ?
                AND friendsOut.target = collections.ownerId
            LEFT JOIN interactions.friends friendsIn
                ON friendsIn.source = collections.ownerId
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
                ${ownerIdClause}
                ${queryClause}
                ${tagClause}
            ORDER BY ${orderClause}
            LIMIT ? OFFSET ?
        `,
        [
            ...interactionParams,
            ...Array(4).fill(getAs),
            ...trendingParams,
            ...visibilityParams,
            ...recentParams,
            ...homeParams,
            ...homeRecentParams,
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

    const countResult = db.collections.query<{ total: number }>(
        `
            SELECT COUNT(*) as total
            FROM main.collections
            LEFT JOIN users.users 
                ON users.id = collections.ownerId
            LEFT JOIN users.usernames 
                ON usernames.userId = users.id 
                AND usernames.isPrimary = 1
            LEFT JOIN badges.badges verifiedBadges
                ON verifiedBadges.id = users.id
                AND verifiedBadges.type = 'VERIFIED'
            LEFT JOIN interactions.hides 
                ON hides.target = collections.id 
                AND hides.source = ?
            LEFT JOIN interactions.follows 
                ON follows.target = collections.ownerId 
                AND follows.source = ?
            LEFT JOIN interactions.friends friendsOut
                ON friendsOut.source = ?
                AND friendsOut.target = collections.ownerId
            LEFT JOIN interactions.friends friendsIn
                ON friendsIn.source = collections.ownerId
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
                ${ownerIdClause}
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
            ...ownerIdParams,
            ...queryParams,
            ...tagParams
        ]
    );

    assertDbSuccess(countResult);

    const totalCount = countResult.rows[0]?.total || 0;

    let itemsByCollectionId: Record<string, Omit<CollectionItemType, "collectionId">[]> = {};

    if (includeCollectionItems && result.rows.length > 0) {
        const collectionIds = result.rows.map(row => row.id);
        const placeholders = collectionIds.map(() => "?").join(",");

        const itemsQueryResult = db.collections.query<CollectionItemType>(
            `
                SELECT * 
                FROM items 
                WHERE collectionId IN (${placeholders})
            `,
            collectionIds
        );

        assertDbSuccess(itemsQueryResult);

        itemsByCollectionId = itemsQueryResult.rows.reduce<
            Record<string, Omit<CollectionItemType, "collectionId">[]>
        >((acc, item) => {
            const { collectionId, ...itemWithoutCollectionId } = item;
            if (!acc[collectionId]) {
                acc[collectionId] = [];
            }
            acc[collectionId].push(itemWithoutCollectionId);
            return acc;
        }, {});
    }

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
            ...(includeCollectionItems && { items: itemsByCollectionId[row.id as string] || [] })
        };

        return formattedRow as GetCollectionItemType;
    });

    return {
        items: parsedRows,
        count: totalCount
    };
}
