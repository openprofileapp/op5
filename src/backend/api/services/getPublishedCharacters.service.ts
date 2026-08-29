import { DateTime } from "luxon";
import { config } from "../../../../app.config.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { GetPublishedCharacterItemType, GetPublishedCharacterType } from "../../../_common/types/character.type.js";
import { GetFromType } from "../../../_common/types/getFrom.type.js";
import { SortByType } from "../../../_common/types/sortBy.type.js";
import { parseJson } from "../../_common/helpers/parseJson.js";
import { db } from "../databases/db.js";
import getInterestsService from "./getInterests.service.js";
import { InteractionNameType } from "../../../_common/types/interaction.type.js";

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
    includeInteractionItems?: boolean;
};

export default function getPublishedCharactersService({
    id,
    ownerId,
    query,
    tag,
    sortBy,
    offset = 0,
    limit = config.limits.assetsPerPage,
    getAs,
    getFrom,
    includeInteractionItems = false
}: Props): GetPublishedCharacterType {    
    let interests;

    if (getAs) {
        interests = getInterestsService(getAs); 
    }

    const userInterestArray = interests?.items || [];

    const idClause = id ? "AND published.id = ?" : "";
    const idParams = id ? [id] : [];

    const ownerIdClause = ownerId ? "AND published.ownerId = ?" : "";
    const ownerIdParams = ownerId ? [ownerId] : [];

    const verifiedClause = sortBy === "verified" ? "AND verifiedBadges.id IS NOT NULL" : "";

    const recentClause = sortBy === "recent" ? "AND published.updatedDate >= ?" : "";
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
        ) trendingStats ON trendingStats.target = published.id
    ` : "";

    const trendingWhereClause = sortBy === "trending" ? "AND trendingStats.target IS NOT NULL" : "";

    const isHomePage = Boolean(getAs && getFrom === "home");

    const homeClause = isHomePage && sortBy !== "recent"
        ? `AND NOT EXISTS (
            SELECT 1 FROM interactions.dismisses WHERE target = published.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.likes WHERE target = published.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.reads WHERE target = published.id AND source = ?
            UNION ALL
            SELECT 1 FROM interactions.follows WHERE (target = published.id OR target = published.ownerId) AND source = ?
        )`
        : "";

    const homeParams = isHomePage && sortBy !== "recent"
        ? [...Array(4).fill(getAs)]
        : [];

    const homeRecentClause = isHomePage && sortBy === "recent"
        ? `AND EXISTS (
            SELECT 1 FROM interactions.follows 
            WHERE target = published.id AND source = ?
        )
        AND NOT EXISTS (
            SELECT 1 FROM interactions.dismisses 
            WHERE target = published.id 
                AND source = ? 
                AND date > published.updatedDate
        )
        AND NOT EXISTS (
            SELECT 1 FROM interactions.views 
            WHERE target = published.id 
                AND source = ? 
                AND date > published.updatedDate
        )`
        : "";

    const homeRecentParams = isHomePage && sortBy === "recent"
        ? [...Array(3).fill(getAs)]
        : [];

    const trimmedQuery = query?.trim();
    const queryTerm = `%${trimmedQuery}%`;

    const queryClause = trimmedQuery 
        ? `AND (
            published.displayName LIKE ? 
            OR published.about LIKE ? 
            OR published.tags LIKE ?
            OR users.displayName LIKE ?
            OR usernames.username LIKE ?
        )` 
        : "";

    const queryParams = trimmedQuery 
        ? [...Array(5).fill(queryTerm)] 
        : [];

    const trimmedTag = tag?.trim();
    
    const tagClause = trimmedTag ? "AND published.tags LIKE ?" : "";
    const tagParams = trimmedTag ? [`%"${trimmedTag}"%`] : [];

    let formattedSortBy: string;

    switch (sortBy) {
        case "trending":
            formattedSortBy = "trendingStats.recentActivityCount DESC, published.algorithmScore DESC";
            break;
        case "popularAsc":
            formattedSortBy = "published.algorithmScore ASC";
            break;
        case "recent":
            formattedSortBy = "published.updatedDate DESC";
            break;
        case "newest":
            formattedSortBy = "published.createdDate DESC";
            break;
        case "oldest":
            formattedSortBy = "published.createdDate ASC";
            break;
        case "nameAsc":
            formattedSortBy = "published.displayName ASC";
            break;
        case "nameDesc":
            formattedSortBy = "published.displayName DESC";
            break;
        default:
            formattedSortBy = "published.algorithmScore DESC";
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
                () => "(CASE WHEN published.tags LIKE ? THEN ? ELSE 0 END)"
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
            published.visibility NOT IN ('public', 'private', 'registered') AND (
                (published.visibility = 'followers' AND follows.source IS NOT NULL) OR
                (published.visibility = 'friends' AND friendsOut.source IS NOT NULL AND friendsIn.source IS NOT NULL)
            )
        )`;
    } else {
        visibilityCondition = `(
            (published.visibility = 'public') OR
            (published.visibility = 'registered' AND ? IS NOT NULL) OR
            (published.visibility = 'followers' AND follows.source IS NOT NULL) OR
            (published.visibility = 'friends' AND friendsOut.source IS NOT NULL AND friendsIn.source IS NOT NULL) OR
            (published.visibility = 'unlisted' AND published.ownerId = ? AND ${getFrom === "userProfile" ? "TRUE" : "FALSE"}) OR
            (
                published.visibility = 'private' AND 
                ${getFrom === "userProfile" ? "TRUE" : "FALSE"} AND (
                    published.ownerId = ? OR 
                    EXISTS (
                        SELECT 1 FROM users.permissions 
                        WHERE permissions.assetId = published.id 
                        AND permissions.userId = ?
                    )
                )
            )
        )`;

        visibilityParams.push(...Array(4).fill(getAs));
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
        interactionParams.push(getAs, getAs);

        const items = includeInteractionItems 
            ? `'items', COALESCE((SELECT json_group_array(json_object('source', source, 'target', target, 'date', date)) FROM interactions.${table} WHERE target = published.id), json('[]')),` 
            : "";

        return `
            '${table}', json_object(
                ${items}
                'count', (SELECT COUNT(*) FROM interactions.${table} WHERE target = published.id),
                'hasInteracted', CASE WHEN ? IS NOT NULL AND EXISTS (SELECT 1 FROM interactions.${table} WHERE target = published.id AND source = ?) THEN json('true') ELSE json('false') END
            )
        `;
    };

    const interactionFieldsSql = interactionTables.map(buildInteractionField).join(",");

    const result = db.characters.query(
        `
            SELECT 
                published.*,
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
                        WHERE b.id = published.id
                    ),
                    json('[]')
                ) AS badges,
                json_object(
                    ${interactionFieldsSql}
                ) AS interactions
            FROM main.published
            LEFT JOIN users.users 
                ON users.id = published.ownerId
            LEFT JOIN users.usernames 
                ON usernames.userId = users.id 
                AND usernames.isPrimary = 1
            LEFT JOIN badges.badges verifiedBadges
                ON verifiedBadges.id = users.id
                AND verifiedBadges.type = 'verified'
            LEFT JOIN interactions.hides 
                ON hides.target = published.id 
                AND hides.source = ?
            LEFT JOIN interactions.follows 
                ON follows.target = published.ownerId 
                AND follows.source = ?
            LEFT JOIN interactions.friends friendsOut
                ON friendsOut.source = ?
                AND friendsOut.target = published.ownerId
            LEFT JOIN interactions.friends friendsIn
                ON friendsIn.source = published.ownerId
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

    const countResult = db.characters.query<{ total: number }>(
        `
            SELECT COUNT(*) as total
            FROM main.published
            LEFT JOIN users.users 
                ON users.id = published.ownerId
            LEFT JOIN users.usernames 
                ON usernames.userId = users.id 
                AND usernames.isPrimary = 1
            LEFT JOIN badges.badges verifiedBadges
                ON verifiedBadges.id = users.id
                AND verifiedBadges.type = 'verified'
            LEFT JOIN interactions.hides 
                ON hides.target = published.id 
                AND hides.source = ?
            LEFT JOIN interactions.follows 
                ON follows.target = published.ownerId 
                AND follows.source = ?
            LEFT JOIN interactions.friends friendsOut
                ON friendsOut.source = ?
                AND friendsOut.target = published.ownerId
            LEFT JOIN interactions.friends friendsIn
                ON friendsIn.source = published.ownerId
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

    const parsedRows = result.rows.map(row => {
        delete row.ownerId;

        const owner = parseJson(row.owner);

        if (owner && typeof owner.badges === "string") {
            owner.badges = parseJson(owner.badges);
        }

        return {
            ...row,
            owner,
            badges: parseJson(row.badges),
            tags: parseJson(row.tags),
            interactions: parseJson(row.interactions)
        } as GetPublishedCharacterItemType;
    });

    return {
        items: parsedRows,
        count: totalCount
    };
}
