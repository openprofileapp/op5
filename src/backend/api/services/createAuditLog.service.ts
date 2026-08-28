import { db } from "../databases/db.js";
import { snowflake } from "../instances.js";
import { AuditNameType } from "../../../_common/types/audit.type.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";

type Props = {
    target?: string;
    changes?: unknown;
    origin?: string;
};

function serialize(value: unknown) {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return value;
}

/**
 * Creates and records an audit log entry.
 * @example
 * createAuditLogService(
 *   type: "authentications",
 *   action: "DELETED",
 *   source: { geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent },
 *   {
 *      target: "0000000000000000",
 *      changes: { new: { geoIp: newGeoIpLatestFetch, userAgent: formattedUserAgent }, old: { geoIp: rowGeoIpJSON, userAgent: rowUserAgentJSON }},
 *      origin: req.originalUrl
 *   });
 */
export default function createAuditLogService(
    type: AuditNameType,
    action: string,
    source: string,
{
    target,
    changes,
    origin
}: Props = {}) {
    assertNotNull([type, action, source]);

    const columns = [
        "id",
        "source",
        ...(target !== undefined ? ["target"] : []),
        "action",
        ...(changes !== undefined ? ["changes"] : []),
        ...(origin !== undefined ? ["origin"] : [])
    ];

    const values = [
        snowflake.gen(),
        serialize(source),
        ...(target !== undefined ? [serialize(target)] : []),
        action,
        ...(changes !== undefined ? [serialize(changes)] : []),
        ...(origin !== undefined ? [origin] : [])
    ];

    const placeholders = columns.map(() => "?").join(", ");

    const result = db.audits.query(
        `INSERT INTO ${type} (${columns.join(", ")})
         VALUES (${placeholders})`,
        values
    );

    assertDbSuccess(result);
}
