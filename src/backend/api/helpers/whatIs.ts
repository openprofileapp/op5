import { AdvancedError } from "kage-library";

import { BadgeNameType, GetBadgeType } from "../../../_common/types/badge.type.js";
import { GetUserItemType, UserType } from "../../../_common/types/user.type.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import getUsersService from "../services/getUsers.service.js";
import { GetPublishedCharacterItemType, PublishedCharacterType } from "../../../_common/types/character.type.js";
import getPublishedCharactersService from "../services/getPublishedCharacters.service.js";

type AssetType = 
    "USER" | 
    "CHARACTER" | 
    "UNIVERSE" | 
    "COLLECTION"
;

export type WhatIsType = {
    id: string;
    ownerId?: string;
    displayName?: string;
    avatar?: string;
    type: AssetType;
    tags: string[];
    createdDate: string;
    updatedDate?: string;
    isPremium: boolean;
    isVerified: boolean;
    isPromoted: boolean;
    isOfficial: boolean;
}

function hasBadge(badges: GetBadgeType[], badgeType: BadgeNameType): boolean {
    return badges.some((b) => b.type === badgeType);
}

function formatReturnData(
    type: AssetType, 
    data: GetUserItemType | GetPublishedCharacterItemType
): WhatIsType {
    const badges = type === "USER" 
        ? (data as GetUserItemType).badges 
        : (data as GetPublishedCharacterItemType).owner?.badges ?? [];

    return {
        id: data.id,
        ...(type !== "USER" && "owner" in data && { ownerId: data.owner.id }),
        displayName: data.displayName,
        avatar: data.avatar,
        type: type,
        tags: data.tags,
        createdDate: data.createdDate,
        ...(type !== "USER" && "updatedDate" in data && { updatedDate: data.updatedDate }),
        isPremium: hasBadge(badges, "PREMIUM"),
        isVerified: hasBadge(badges, "VERIFIED"),
        isPromoted: hasBadge(badges, "PROMOTED"),
        isOfficial: hasBadge(badges, "OFFICIAL")
    }
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
 * //   ownerId?: "00000000000000000"
 * //   displayName?: "Test"
 * //   avatar?: "/avatars/00000000000000000/hash.png"
 * //   type: "USER"
 * //   tags: ["author", "writer"]
 * //   createdDate: "2026-01-01T00:00:00Z";
 * //   updatedDate?: "2026-01-01T00:00:00Z";
 * //   isPremium: true
 * //   isVerified: true
 * //   isPromoted: false
 * //   isOfficial": true
 * // }
 * ```
 */
export default function whatIs(
    id: string
): WhatIsType {
    assertNotNull(id);

    const userResult = db.users.query<UserType>(
        "SELECT * FROM users WHERE id = ?", 
        [id]
    );

    assertDbSuccess(userResult);

    if (userResult.rowCount !== 0) {
        const getResult = getUsersService({
            idOrUsername: id,
            internalPermissionsBypass: true
        });

        const data = getResult.items[0];

        if (data) {
            return formatReturnData("USER", data)
        }
    }

    const characterResult = db.characters.query<PublishedCharacterType>(
        "SELECT * FROM drafts WHERE id = ?", 
        [id]
    );

    assertDbSuccess(characterResult);

    if (characterResult.rowCount !== 0) {
        const getResult = getPublishedCharactersService({
            id,
            internalPermissionsBypass: true
        });

        const data = getResult.items[0];

        if (data) {
            return formatReturnData("CHARACTER", data)
        }
    }

    throw new AdvancedError({
        code: 404,
        message: "Id not found",
    })
}
