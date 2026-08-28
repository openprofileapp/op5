import { db } from "../databases/db.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";

export default function getInterestsService(id: string) {
    assertNotNull(id);

    const result = db.users.query(
        "SELECT * FROM interests WHERE userId = ?", 
        [id]
    );

    assertDbSuccess(result);

    return {
        items: result.rows,
        count: result.rowCount,
    };
}
