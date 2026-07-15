import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";

export default function getPinsByOwnerId(id: string) {
    if (!id) {
        throw new AdvancedError({
            code: 400,
            message: "Invalid id" // OR malformed request and assign as like a config or lang
        })
    }

    const result = db.pins.query(
        "SELECT * FROM pins WHERE ownerId = ?", 
        [id]
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching pins",
            details: result.error
        })
    }

    return {
        count: result.rowCount, // maybe have a count? Needs a response if no pins exist
        pins: result.rows
    };
}