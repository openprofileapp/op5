import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import getPublicUserByIdOrUsername, { getPublicUserByIdOrUsernameType } from "../services/getPublicUserByIdOrUsername.service.js";
import { CharacterType } from "../../../_common/types/queries/character.type.js";
import { UserProfileType } from "../../../_common/types/queries/userProfile.type.js";

type AssetType = 
    "USER" | 
    "CHARACTER" | 
    "UNIVERSE" | 
    "COLLECTION"
;

export type WhatIsType = {
    id: string;
    type: AssetType;
    isPremium: boolean;
    isVerified: boolean;
    isOfficial: boolean;
}

function hasBadge(owner: getPublicUserByIdOrUsernameType, badgeType: string): boolean {
    return Array.isArray(owner.badges) && owner.badges.some((b) => b.type === badgeType);
}

/**
 * Identifies the asset category based on a given unique id.
 *
 * @param id - The unique asset ID string to inspect.
 * @returns The {@link WhatIsType} if the ID is unrecognized.
 * @throws {AdvancedError} Throws a 400 `AdvancedError` if the provided id is null or not found.
 *
 * @example
 * ```ts
 * const assetType = whatIs("00000000000000000");
 * console.log(assetType); 
 * // {
 * //   id: "00000000000000000"
 * //   type: "USER"
 * //   isPremium: true
 * //   isVerified: true
 * //   isOfficial": true
 * // }
 * ```
 */
export default function whatIs(id: string): WhatIsType {
    if (!id) {
        throw new AdvancedError({
            code: 400,
            message: "Malformed request"
        });
    }

    // USER
    const userResult = db.users.query<UserProfileType>(
        "SELECT id FROM users WHERE id = ?", 
        [id]
    );

    if (!userResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching user",
            details: userResult.error
        })
    }

    if (userResult.rowCount === 1) {
        const owner = getPublicUserByIdOrUsername(id);

        return {
            id,
            type: "USER",
            isPremium: hasBadge(owner, "premium"),
            isVerified: hasBadge(owner, "verified"),
            isOfficial: hasBadge(owner, "official")
        }
    }

    let type: AssetType | undefined;
    let ownerId: string | undefined;

    // CHARACTER
    const characterResult = db.characters.query<CharacterType>(
        "SELECT * FROM drafts WHERE id = ?", 
        [id]
    );

    if (!characterResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching character",
            details: characterResult.error
        })
    }

    if (characterResult.rowCount === 1) {
        type = "CHARACTER";
        ownerId = characterResult.rows[0].ownerId;
    }

    // DEVELOPER NEEDED: Add UNIVERSE and COLLECTION

    if (type && type !== "USER" && ownerId) {
        const owner = getPublicUserByIdOrUsername(ownerId);

        if (!owner) {
            throw new AdvancedError({
                code: 404,
                message: "Owner not found",
            })
        }

        return {
            id,
            type,
            isPremium: hasBadge(owner, "premium"),
            isVerified: hasBadge(owner, "verified"),
            isOfficial: hasBadge(owner, "official")
        };
    }

    // NULL
    throw new AdvancedError({
        code: 404,
        message: "Id not found",
    })
}
