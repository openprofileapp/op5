import { AdvancedError } from "kage-library";

import { db, snowflake } from "../server.js";

type Props = {
    type: string;
    source: string;
    target?: string;
    action: string;
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

export default function createAuditLog({
    type,
    source,
    target,
    action,
    changes,
    origin
}: Props) {
    if (!type) {
        throw new AdvancedError({
            code: 400,
            message: "type is missing"
        });
    }

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

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while saving audit log",
            details: result.error
        });
    }
}