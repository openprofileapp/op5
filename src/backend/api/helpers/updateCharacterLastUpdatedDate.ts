import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../databases/db.js";

export default function updateCharacterLastEditedDate(
    id: string
) {
    const now = new Date().toISOString();

    const updateDateResult = db.characters.query(
        "UPDATE drafts SET updatedDate = ? WHERE id = ?",
        [now, id]
    );

    assertDbSuccess(updateDateResult);

    return now;
}
