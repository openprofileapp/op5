
import { AdvancedError } from "kage-library";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { AssetNameType } from "../../../_common/types/asset.type.js";

export default function getAssetType(id: string): AssetNameType {
    if (!id) {
        throw new AdvancedError({
            code: 400,
            message: "Asset ID is required"
        });
    }

    const userResult = db.users.query(
        "SELECT id FROM users WHERE id = ?",
        [id]
    );

    assertDbSuccess(userResult);

    if (userResult.rowCount > 0) {
        return "USER";
    }

    const characterResult = db.characters.query(
        "SELECT id FROM drafts WHERE id = ? OR slug = ?",
        [id, id]
    );

    assertDbSuccess(characterResult);

    if (characterResult.rowCount > 0) {
        return "CHARACTER";
    }

    const collectionResult = db.collections.query(
        "SELECT id FROM collections WHERE id = ?",
        [id]
    );

    assertDbSuccess(collectionResult);

    if (collectionResult.rowCount > 0) {
        return "COLLECTION";
    }

    throw new AdvancedError({
        code: 404,
        message: "Asset not found"
    });
}
