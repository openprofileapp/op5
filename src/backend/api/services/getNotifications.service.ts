import { config } from "../../../../app.config.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import {
    GetNotificationInboxType,
    NotificationInboxType,
    NotificationNameType
} from "../../../_common/types/notification.type.js";
import { WhatIsType } from "../../../_common/types/whatIs.type.js";
import { parseJson } from "../../_common/helpers/parseJson.js";
import { db } from "../databases/db.js";
import whatIs from "./whatIs.service.js";

type Props = {
    userId: string;
    query?: string;
    sortBy?: NotificationNameType;
    offset?: number;
    limit?: number;
};

type NotificationData = Record<string, unknown> | null;

type ParsedNotification = Omit<NotificationInboxType, "data"> & {
    data: NotificationData;
};

export default function getNotificationsService({
    userId,
    query,
    sortBy,
    offset = 0,
    limit = config.limits.assetsPerPage
}: Props): GetNotificationInboxType {
    const trimmedQuery = query?.trim();
    const queryTerm = trimmedQuery ? `%${trimmedQuery}%` : undefined;

    const typeClause = sortBy
        ? "AND inbox.type = ?"
        : "";

    const typeParams = sortBy ? [sortBy] : [];

    const matchingCharacterIds: string[] = [];
    const matchingCollectionIds: string[] = [];

    if (queryTerm) {
        const charactersResult = db.characters.query<{ id: string }>(
            `
                SELECT id
                FROM drafts
                WHERE LOWER(id) LIKE LOWER(?)
                    OR LOWER(displayName) LIKE LOWER(?)
            `,
            [queryTerm, queryTerm]
        );

        assertDbSuccess(charactersResult);

        matchingCharacterIds.push(
            ...charactersResult.rows.map(character => character.id)
        );

        const collectionsResult = db.collections.query<{ id: string }>(
            `
                SELECT id
                FROM collections
                WHERE LOWER(id) LIKE LOWER(?)
                    OR LOWER(displayName) LIKE LOWER(?)
            `,
            [queryTerm, queryTerm]
        );

        assertDbSuccess(collectionsResult);

        matchingCollectionIds.push(
            ...collectionsResult.rows.map(collection => collection.id)
        );
    }

    const createEntityClause = (ids: string[]) => {
        if (ids.length === 0) {
            return "";
        }

        const placeholders = ids.map(() => "?").join(", ");

        return `
            OR (
                json_valid(inbox.data)
                AND (
                    json_extract(inbox.data, '$.source') IN (${placeholders})
                    OR json_extract(inbox.data, '$.target') IN (${placeholders})
                    OR json_extract(inbox.data, '$.collection') IN (${placeholders})
                )
            )
        `;
    };

    const characterClause = createEntityClause(matchingCharacterIds);
    const collectionClause = createEntityClause(matchingCollectionIds);

    const queryClause = queryTerm
        ? `
            AND (
                LOWER(inbox.data) LIKE LOWER(?)
                OR LOWER(inbox.type) LIKE LOWER(?)

                OR EXISTS (
                    SELECT 1
                    FROM users u
                    LEFT JOIN usernames un
                        ON un.userId = u.id
                        AND un.isPrimary = 1
                    WHERE json_valid(inbox.data)
                        AND (
                            json_extract(inbox.data, '$.source') = u.id
                            OR json_extract(inbox.data, '$.target') = u.id
                        )
                        AND (
                            LOWER(u.displayName) LIKE LOWER(?)
                            OR LOWER(un.username) LIKE LOWER(?)
                            OR LOWER(u.id) LIKE LOWER(?)
                        )
                )

                ${characterClause}

                ${collectionClause}
            )
        `
        : "";

    const queryParams: (string | number)[] = queryTerm
        ? [
            queryTerm,
            queryTerm,
            queryTerm,
            queryTerm,
            queryTerm,
            ...matchingCharacterIds,
            ...matchingCharacterIds,
            ...matchingCharacterIds,
            ...matchingCollectionIds,
            ...matchingCollectionIds,
            ...matchingCollectionIds
        ]
        : [];

    const result = db.users.query<NotificationInboxType>(
        `
            SELECT
                inbox.userId,
                inbox.type,
                inbox.data,
                inbox.isRead,
                inbox.readDate,
                inbox.sentDate
            FROM inbox
            WHERE inbox.userId = ?
                ${typeClause}
                ${queryClause}
            ORDER BY
                inbox.isRead ASC,
                inbox.sentDate DESC
            LIMIT ? OFFSET ?
        `,
        [
            userId,
            ...typeParams,
            ...queryParams,
            limit,
            offset
        ]
    );

    assertDbSuccess(result);

    const countResult = db.users.query<{ total: number }>(
        `
            SELECT COUNT(*) AS total
            FROM inbox
            WHERE inbox.userId = ?
                ${typeClause}
                ${queryClause}
        `,
        [
            userId,
            ...typeParams,
            ...queryParams
        ]
    );

    assertDbSuccess(countResult);

    const totalCount = Number(countResult.rows[0]?.total ?? 0);

    const unreadResult = db.users.query<{ unreadCount: number }>(
        `
            SELECT COUNT(*) AS unreadCount
            FROM inbox
            WHERE userId = ?
                AND isRead = 0
        `,
        [userId]
    );

    assertDbSuccess(unreadResult);

    const unreadCount = Number(
        unreadResult.rows[0]?.unreadCount ?? 0
    );

    const entitiesById = new Map<string, WhatIsType | null>();

    const items: ParsedNotification[] = result.rows.map(notification => {
        const data: NotificationData = notification.data
            ? parseJson(notification.data) as NotificationData
            : null;

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return {
                ...notification,
                data
            };
        }

        for (const key of ["source", "target", "collection"]) {
            const id = data[key];

            if (typeof id !== "string") {
                continue;
            }

            if (!entitiesById.has(id)) {
                try {
                    entitiesById.set(id, whatIs(id, false, userId));
                } catch {
                    entitiesById.set(id, null);
                }
            }

            data[key] = entitiesById.get(id) ?? null;
        }

        return {
            ...notification,
            data
        };
    });

    return {
        items,
        count: totalCount,
        unreadCount
    } as GetNotificationInboxType;
}
