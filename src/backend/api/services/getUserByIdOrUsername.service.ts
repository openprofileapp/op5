import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import { UserProfileType } from "../../../_common/types/queries/userProfile.type.js";
import { BadgeType } from "../../../_common/types/queries/badge.type.js";
import { LinkType } from "../../../_common/types/queries/link.type.js";
import getBadgesById from "./getBadgesById.service.js";

export type getUserByIdOrUsernameType = UserProfileType & {
    badges: BadgeType[],
    links: LinkType,
    // DEVELOPER NEEDED: Create interaction type
};

// DEVELOPER NEEDED: Rename to getUserProfileByIdOrUsername
export default function getUserByIdOrUsername(id?: string): getUserByIdOrUsernameType {
    const userResult = db.users.query<UserProfileType>(
        "SELECT * FROM users WHERE id = ? OR username = ? OR usernameOld = ?", 
        [id, id, id]
    );

    if (!userResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching user",
            details: userResult.error
        })
    }

    if (userResult.rowCount < 1) {
        throw new AdvancedError({
            code: 404,
            message: "User not found"
        })
    }
  
    const badges = getBadgesById(userResult.rows[0].id);

    const linksResult = db.links.query<LinkType>(
        "SELECT * FROM links WHERE id = ?", 
        [userResult.rows[0].id]
    );

    if (!linksResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching links",
            details: linksResult.error
        })
    }

    const followingResult = db.interactions.query(
        "SELECT * FROM follows WHERE source = ?", 
        [userResult.rows[0].id]
    );

    const followersResult = db.interactions.query(
        "SELECT * FROM follows WHERE target = ?", 
        [userResult.rows[0].id]
    );

    if (!followingResult.success || !followersResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching follows",
            details: {
            ...(!followingResult.success && { following: followingResult.error }),
            ...(!followersResult.success && { followers: followersResult.error }),
            }
        })
    }
    
    return {
        ...userResult.rows[0],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        badges: badges.map(({ id, ...badge }) => badge),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        links: linksResult.rows.map(({ id, ...link }) => link),
        interactions: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            following: followingResult.rows.map(({ source, ...follow }) => follow),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            followers: followersResult.rows.map(({ target, ...follower }) => follower),
        }

        // Get the count somewhere, but not as var, but count directly from the query
    };
}