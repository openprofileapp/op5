import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import PlatformPermissionsService from "../../../../_common/services/platformPermissions.service.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from private");

db.accounts.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO users (
                id,
                hasEmail,
                permissions,
                locale,
                timezone,
                isSuspended,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.email,
                PlatformPermissionsService.getRole("member").value,
                d.locale,
                d.timezone,
                d.suspended,
                DateTime.fromSQL(d.created_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});