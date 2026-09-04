import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import PlatformPermissionsService from "../../../../_common/services/platformPermissions.service.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from private");

db.accounts.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (d.permissions === "295148468129306247231") {
            d.permissions = PlatformPermissionsService.getRole("premium").value;
        }

        if (d.permissions === "1475740088846717550655") {
            d.permissions = PlatformPermissionsService.getRole("partner").value;
        }

        if (d.permissions === "295159727130459242527") {
            const permissions = [
                ...PlatformPermissionsService.getRole("staff").array,
                ...PlatformPermissionsService.getRole("moderator").array,
            ];

            d.permissions = PlatformPermissionsService.encode(permissions);
        }

        if (d.permissions === "36028797018963968") {
            d.permissions = PlatformPermissionsService.getRole("admin").value;
        }

        if (d.id === "9534968913312158") {
            d.permissions = PlatformPermissionsService.encode(["SUPER_ADMIN"]);
        }

        if (d.id === "8057185762390040" || d.id === "3912544802938547") {
            d.permissions = PlatformPermissionsService.getRole("staff").value;
        }

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
                d.permissions || "0",
                d.locale,
                d.timezone,
                d.suspended,
                DateTime.fromSQL(d.created_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});
