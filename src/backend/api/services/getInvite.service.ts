import { config } from "../../../../app.config.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { db } from "../databases/db.js";
import whatIs from "./whatIs.service.js";

type Props = {
    code?: string;
    owner?: string;
    getAs?: string;
    includeUsers?: boolean;
    offset?: number;
};

export default function getInviteService({
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

        const premiumResult = db.invites.query(
            `SELECT COUNT(DISTINCT u.userId) AS count
             FROM uses u
             INNER JOIN badges b ON b.id = u.userId
             WHERE u.code = ?
               AND b.type = 'PREMIUM'`,
            [invite.code]
        );

        assertDbSuccess(premiumResult);

        const premiumUsers = Number(
            premiumResult.rows[0]?.count ?? 0
        );

        if (!includeUsers) {
            return {
                ...invite,
                uses,
                premiumUsers
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

        const users = usersResult.rows.map(row => ({
            ...whatIs(row.userId as string, false, getAs),
            date: row.date
        }));

        return {
            ...invite,
            uses,
            premiumUsers,
            users
        };
    }

    const isOwner = getAs === owner;

    if (!isOwner) {
        return invites;
    }

    const codeList = invites.map(invite => invite.code as string);
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

    const premiumResult = db.invites.query(
        `SELECT u.code, COUNT(DISTINCT u.userId) AS count
         FROM uses u
         INNER JOIN badges b ON b.id = u.userId
         WHERE u.code IN (${placeholders})
           AND b.type = 'PREMIUM'
         GROUP BY u.code`,
        codeList
    );

    assertDbSuccess(premiumResult);

    const premiumMap = new Map<string, number>(
        premiumResult.rows.map(row => [
            row.code as string,
            Number(row.count)
        ])
    );

    const enrichedInvites = invites.map(invite => ({
        ...invite,
        uses: usesMap.get(invite.code as string) ?? 0,
        premiumUsers: premiumMap.get(invite.code as string) ?? 0
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

    const users = usersResult.rows.map(row => ({
        code: row.code,
        ...whatIs(row.userId as string, false, getAs),
        date: row.date
    }));

    return {
        invites: enrichedInvites,
        users
    };
}
