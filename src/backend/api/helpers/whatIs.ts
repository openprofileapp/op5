import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import getUserByIdOrUsername, { getUserByIdOrUsernameType } from "../services/getUserByIdOrUsername.service.js";
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
    tags: string[];
    createdDate: string;
    updatedDate?: string;
    isPremium: boolean;
    isVerified: boolean;
    isPromoted: boolean;
    isOfficial: boolean;
}

function hasBadge(owner: getUserByIdOrUsernameType, badgeType: string): boolean {
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
 * //   tags: ["author", "writer"]
 * //   isPremium: true
 * //   isVerified: true
 * //   isPromoted: false
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
        const owner = getUserByIdOrUsername(id);

        return {
            id,
            type: "USER",
            tags: JSON.parse(owner.tags),
            createdDate: owner.createdDate,
            isPremium: hasBadge(owner, "premium"),
            isVerified: hasBadge(owner, "verified"),
            isPromoted: hasBadge(owner, "promoted"),
            isOfficial: hasBadge(owner, "official")
        }
    }

    let type: AssetType | undefined;
    let tags: string[] | undefined;
    let ownerId: string | undefined;
    let createdDate: string | undefined;
    let updatedDate: string | undefined;

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
        tags = JSON.parse(characterResult.rows[0].tags);
        ownerId = characterResult.rows[0].ownerId;
        createdDate = characterResult.rows[0].createdDate;
        updatedDate = characterResult.rows[0].updatedDate;
    }

    // DEVELOPER NEEDED: Add UNIVERSE and COLLECTION

    if (
        type &&
        type !== "USER" &&
        tags &&
        createdDate &&
        updatedDate &&
        ownerId
    ) {
        const owner = getUserByIdOrUsername(ownerId);

        if (!owner) {
            throw new AdvancedError({
                code: 404,
                message: "Owner not found",
            })
        }

        return {
            id,
            type,
            tags,
            createdDate,
            updatedDate,
            isPremium: hasBadge(owner, "premium"),
            isVerified: hasBadge(owner, "verified"),
            isPromoted: hasBadge(owner, "promoted"),
            isOfficial: hasBadge(owner, "official")
        };
    }

    // NULL
    throw new AdvancedError({
        code: 404,
        message: "Id not found",
    })
}
