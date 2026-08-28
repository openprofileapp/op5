import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { db } from "../databases/db.js";

type Props = {
    code?: string;
    owner?: string;
    getAs?: string;
};

export default function getInviteService({
    code,
    owner,
    getAs
}: Props) {
    const result = code
        ? db.invites.query("SELECT * FROM codes WHERE code = ?", [code])
        : owner
        ? db.invites.query("SELECT * FROM codes WHERE ownerId = ?", [owner])
        : null;

    assertNotNull(result);
    assertDbSuccess(result);

    if (result.rowCount < 1) {
        return { error: "Code not found" };
    }

    const invites = result.rows;

    if (code) {
        const invite = invites[0];
        let usesCount = 0;

        if (getAs && getAs === invite.ownerId) {
            const usesResult = db.invites.query(
                "SELECT COUNT(*) AS count FROM uses WHERE code = ?",
                [invite.code]
            );
            assertDbSuccess(usesResult);
            usesCount = (usesResult.rows[0]?.count as number) ?? usesResult.rowCount;
        }

        return {
            ...invite,
            ...(getAs === invite.ownerId && { uses: usesCount })
        };
    }

    const isOwner = getAs && owner && getAs === owner;

    if (!isOwner) {
        return invites;
    }

    const codeList = invites.map((i) => i.code);
    const placeholders = codeList.map(() => "?").join(",");

    const usesResult = db.invites.query(
        `SELECT code, COUNT(*) AS count FROM uses WHERE code IN (${placeholders}) GROUP BY code`,
        codeList
    );
    
    assertDbSuccess(usesResult);

    const usesMap = new Map<string, number>(
        usesResult.rows.map((row) => [row.code as string, row.count as number])
    );

    return invites.map((invite) => ({
        ...invite,
        uses: usesMap.get(invite.code as string) ?? 0
    }));
}
