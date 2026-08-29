import { DateTime } from "luxon";
import crypto from "crypto";

import { id } from "../../_common/instances.js";
import { db } from "../databases/db.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";

type Props = {
    userId?: string;
};

export default function updateToken(
    sessionId: string,
    type: "SESSION" | "ACCESS" | "DELEGATION",
    { userId }: Props = {}
): string {
    assertNotNull([sessionId, type]);

    const token = id.gen("TOKEN");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const updates: string[] = [];
    const params: (string | undefined)[] = [];

    if (userId) {
        updates.push("userId = ?");
        params.push(userId);
    }

    switch (type) {
        case "SESSION":
            updates.push("sessionToken = ?", "sessionTokenExpireDate = ?");
            params.push(hashedToken, DateTime.now().toUTC().plus({ days: 30 }).toISO());
            break;
        case "ACCESS":
            updates.push("accessToken = ?", "accessTokenExpireDate = ?");
            params.push(hashedToken, DateTime.now().toUTC().plus({ minutes: 5 }).toISO());
            break;
        case "DELEGATION":
            updates.push("delegationToken = ?");
            params.push(hashedToken);
            break;
    }

    params.push(sessionId);

    const result = db.accounts.query(
        `UPDATE sessions SET ${updates.join(", ")} WHERE sessionId = ? LIMIT 1`,
        params
    );

    assertNotNull(result);

    return token;
}
