import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";

export default function getUserInterestsById(id: string) {
    if (!id) {
        throw new AdvancedError({
            code: 400,
            message: "Invalid id"
        })
    }

    const result = db.users.query(
        "SELECT * FROM interests WHERE userId = ?", 
        [id]
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching interests",
            details: result.error
        })
    }

    return {
        count: result.rowCount,
        interests: result.rows
    };
}