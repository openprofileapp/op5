import { config } from "../../../../app.config.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { db } from "../databases/db.js";
import { wc } from "../instances.js";
import whatIs from "./whatIs.service.js";

type Props = {
    code?: string;
    owner?: string;
    getAs?: string;
    includeUsers?: boolean;
    offset?: number;
};

type SubscriptionRecord = Record<string, string | null>;

async function getSubscriptionMap(
    userIds: string[]
): Promise<SubscriptionRecord> {
    const uniqueUserIds = [...new Set(userIds)];

    if (uniqueUserIds.length === 0) {
        return {};
    }

    return await wc.callAPI<SubscriptionRecord>(
        `https://${config.domains.auth}/billing/get`,
        {
            method: "POST",
            auth: `ApiSecret ${getEnv("API_SECRET")}`,
            body: { userIds: uniqueUserIds }
        }
    );
}

export default async function getInviteService({
    code,
    owner,
    getAs,
    includeUsers = false,
    offset = 0
}: Props) {
    const result = code
        ? db.invites.query(
              "SELECT * FROM codes WHERE code = ? ORDER BY createdDate DESC",
              [code]
          )
        : owner
          ? db.invites.query(
                "SELECT * FROM codes WHERE ownerId = ? ORDER BY createdDate DESC",
                [owner]
            )
          : null;

    assertNotNull(result);
    assertDbSuccess(result);

    if (result.rowCount < 1) {
        return { error: "Code not found" };
    }

    const invites = result.rows;
    const limit = config.limits.assetsPerPage;
    const safeOffset = Math.max(0, Math.floor(offset));

    const createdAfter = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    if (code) {
        const invite = invites[0];
        const isOwner = getAs === invite.ownerId;

        if (!isOwner) {
            return invite;
        }

        const usesResult = db.invites.query(
            "SELECT COUNT(*) AS count FROM uses WHERE code = ?",
            [invite.code]
        );

        assertDbSuccess(usesResult);

        const uses = Number(usesResult.rows[0]?.count ?? 0);

        const allUsersResult = db.invites.query(
            `SELECT DISTINCT userId
             FROM uses
             WHERE code = ?`,
            [invite.code]
        );

        assertDbSuccess(allUsersResult);

        const allUserIds = allUsersResult.rows.map(
            row => String(row.userId)
        );

        const subscriptions = await getSubscriptionMap(allUserIds);

        const premiumUsers = allUserIds.filter(
            userId => subscriptions[userId] === "Subscribed"
        ).length;

        const createdResult = db.invites.query(
            `SELECT COUNT(DISTINCT u.userId) AS count
             FROM uses u
             INNER JOIN users usr ON usr.id = u.userId
             WHERE u.code = ?
               AND usr.createdDate >= ?`,
            [invite.code, createdAfter]
        );

        assertDbSuccess(createdResult);

        const usersLast30Days = Number(
            createdResult.rows[0]?.count ?? 0
        );

        if (!includeUsers) {
            return {
                ...invite,
                uses,
                premiumUsers,
                usersLast30Days
            };
        }

        const usersResult = db.invites.query(
            `SELECT userId, date
             FROM uses
             WHERE code = ?
             ORDER BY date DESC
             LIMIT ? OFFSET ?`,
            [invite.code, limit, safeOffset]
        );

        assertDbSuccess(usersResult);

        const users = usersResult.rows
            .map(row => ({
                ...whatIs(String(row.userId), false, getAs),
                date: row.date,
                subscriptionType:
                    subscriptions[String(row.userId)] ?? null
            }))
            .filter(user => user.subscriptionType !== null);

        return {
            ...invite,
            uses,
            premiumUsers,
            usersLast30Days,
            users
        };
    }

    const isOwner = getAs === owner;

    if (!isOwner) {
        return invites;
    }

    const codeList = invites.map(
        invite => invite.code as string
    );

    const placeholders = codeList.map(() => "?").join(",");

    const usesResult = db.invites.query(
        `SELECT code, COUNT(*) AS count
         FROM uses
         WHERE code IN (${placeholders})
         GROUP BY code`,
        codeList
    );

    assertDbSuccess(usesResult);

    const usesMap = new Map<string, number>(
        usesResult.rows.map(row => [
            row.code as string,
            Number(row.count)
        ])
    );

    const allUsersResult = db.invites.query(
        `SELECT DISTINCT code, userId
         FROM uses
         WHERE code IN (${placeholders})`,
        codeList
    );

    assertDbSuccess(allUsersResult);

    const allUserIds = [
        ...new Set(
            allUsersResult.rows.map(row => String(row.userId))
        )
    ];

    const subscriptions = await getSubscriptionMap(allUserIds);

    const premiumMap = new Map<string, number>();

    for (const row of allUsersResult.rows) {
        const inviteCode = String(row.code);
        const userId = String(row.userId);

        if (subscriptions[userId] === "Subscribed") {
            premiumMap.set(
                inviteCode,
                (premiumMap.get(inviteCode) ?? 0) + 1
            );
        }
    }

    const createdResult = db.invites.query(
        `SELECT u.code, COUNT(DISTINCT u.userId) AS count
         FROM uses u
         INNER JOIN users usr ON usr.id = u.userId
         WHERE u.code IN (${placeholders})
           AND usr.createdDate >= ?
         GROUP BY u.code`,
        [...codeList, createdAfter]
    );

    assertDbSuccess(createdResult);

    const createdMap = new Map<string, number>(
        createdResult.rows.map(row => [
            row.code as string,
            Number(row.count)
        ])
    );

    const enrichedInvites = invites.map(invite => ({
        ...invite,
        uses: usesMap.get(invite.code as string) ?? 0,
        premiumUsers: premiumMap.get(invite.code as string) ?? 0,
        usersLast30Days:
            createdMap.get(invite.code as string) ?? 0
    }));

    if (!includeUsers) {
        return enrichedInvites;
    }

    const usersResult = db.invites.query(
        `SELECT code, userId, date
         FROM uses
         WHERE code IN (${placeholders})
         ORDER BY date DESC
         LIMIT ? OFFSET ?`,
        [...codeList, limit, safeOffset]
    );

    assertDbSuccess(usersResult);

    const users = usersResult.rows
        .map(row => ({
            code: row.code,
            ...whatIs(String(row.userId), true, getAs),
            date: row.date,
            subscriptionType:
                subscriptions[String(row.userId)] ?? null
        }))
        .filter(user => user.subscriptionType !== null);

    return {
        invites: enrichedInvites,
        users
    };
}
