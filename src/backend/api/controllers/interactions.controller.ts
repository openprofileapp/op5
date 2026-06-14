import type { Request, Response } from 'express';

import { db } from '../server.js';

export const getInteractionsCount = (req: Request, res: Response) => {
    const { userId } = req.params;

    // MOVE MOST OF THIS TO AN EXTERNAL SERVICE THEN CALL IT HERE
    // RENAME TO /STATS OR SOMETHING

    // hasPermissionsToView()??
    // ^ isBlocked(); built-in

    // ONLY INCLUDE BLOCKS/FRIENDS/MUTES/RESTRICTS AND STUFF IF ITS THE OWNER OF THE ACCOUNT/ASSET

    /* 
    ————————————————————————————————————————————————————————————————
    userProfileInteractionCounts
    ———————————————————————————————————————————————————————————————— 
    */

    // Following
    const userProfileFollowingResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM follows WHERE source = ?`, 
        [userId]
    );

    if (!userProfileFollowingResult.success) return res.status(500).json(
        { error: "An error occurred while fetching following" }
    );

    // Followers
    const userProfileFollowersResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM follows WHERE target = ?`, 
        [userId]
    );

    if (!userProfileFollowersResult.success) return res.status(500).json(
        { error: "An error occurred while fetching followers" }
    );

    // Shares
    const userProfileSharesResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM shares WHERE target = ?`, 
        [userId]
    );

    if (!userProfileSharesResult.success) return res.status(500).json(
        { error: "An error occurred while fetching shares" }
    );

    // Views
    const userProfileViewsResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM views WHERE target = ?`, 
        [userId]
    );

    if (!userProfileViewsResult.success) return res.status(500).json(
        { error: "An error occurred while fetching views" }
    );

    /* 
    ————————————————————————————————————————————————————————————————
    contentInteractionCounts
    ———————————————————————————————————————————————————————————————— 
    */

    const characterIdsResult = db.characters.query(
        "SELECT id FROM published WHERE ownerId = ?", 
        [userId]
    );

    if (!characterIdsResult.success) return res.status(500).json(
        { error: "An error occurred while fetching characters" }
    );
    
    const characterIds = (characterIdsResult.rows as { id: string }[]).map(c => c.id);
    
    // Followers
    const contentFollowersResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM follows WHERE target IN (
            ${characterIds.map(() => "?").join(",")}
        )`, 
        characterIds
    );
    
    if (!contentFollowersResult.success) return res.status(500).json(
        { error: "An error occurred while fetching followers" }
    );

    // Likes
    const contentLikesResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM likes WHERE target IN (
            ${characterIds.map(() => "?").join(",")}
        )`, 
        characterIds
    );
    
    if (!contentLikesResult.success) return res.status(500).json(
        { error: "An error occurred while fetching likes" }
    );

    // Reads
    const contentReadsResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM reads WHERE target IN (
            ${characterIds.map(() => "?").join(",")}
        )`, 
        characterIds
    );
    
    if (!contentReadsResult.success) return res.status(500).json(
        { error: "An error occurred while fetching reads" }
    );

    // Shares
    const contentSharesResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM shares WHERE target IN (
            ${characterIds.map(() => "?").join(",")}
        )`, 
        characterIds
    );
    
    if (!contentSharesResult.success) return res.status(500).json(
        { error: "An error occurred while fetching shares" }
    );

    console.log(characterIds)

    // Views
    const contentViewsResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM views WHERE target IN (
            ${characterIds.map(() => "?").join(",")}
        )`, 
        characterIds
    );
    
    if (!contentViewsResult.success) return res.status(500).json(
        { error: "An error occurred while fetching views" }
    );

    /* 
    ————————————————————————————————————————————————————————————————
    Response JSON
    ———————————————————————————————————————————————————————————————— 
    */

    res.status(200).json({
        userId,
        userProfileInteractionCounts: {
            following: userProfileFollowingResult.rows[0].count || 0,
            followers: userProfileFollowersResult.rows[0].count || 0,
            shares: userProfileSharesResult.rows[0].count || 0,
            views: userProfileViewsResult.rows[0].count || 0
        },
        contentInteractionCounts: {
            followers: contentFollowersResult.rows[0].count || 0,
            likes: contentLikesResult.rows[0].count || 0,
            reads: contentReadsResult.rows[0].count || 0,
            shares: contentSharesResult.rows[0].count || 0,
            views: contentViewsResult.rows[0].count || 0
        }
    });
};


























// https://api.openprofile.app/v2/interactions/5719552362357773/following?page=2 (list)
// https://api.openprofile.app/v2/interactions/5719552362357773 (all interactions count)
// Which gives only counts; eg 500 views etc.

export const getFollowing = (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page } = req.query;

    // hasPermissionsToView()??
    // ^ isBlocked(); built-in

    const result = db.interactions.query(`SELECT * FROM follows WHERE source = ?`, [userId]);

    if (!result.success) return res.status(500).json({ error: "An error occurred while fetching following" });
    if (result.rowCount < 1) return res.status(404).json({ error: "Interaction not found" });

    const following = result.rows.map((row) => ({ // Type goes at row
        userId: row.target,
        date: row.date
    }));

    res.status(200).json({
        userId,
        count: result.rowCount,
        following
    });
};

export const getFollowers = (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page } = req.query;

    // hasPermissionsToView()??
    // ^ isBlocked(); built-in

    const result = db.interactions.query(`SELECT * FROM follows WHERE target = ?`, [userId]);

    if (!result.success) return res.status(500).json({ error: "An error occurred while fetching interaction" });
    if (result.rowCount < 1) return res.status(404).json({ error: "Interaction not found" });

    const followers = result.rows.map((row) => ({ // Type goes at row
        userId: row.target,
        date: row.date
    }));

    res.status(200).json({
        userId,
        count: result.rowCount,
        followers
    });
};

// DIFFERENT API
// https://api.dev.openprofile.app/v2/relationship/5719552362357773/0000000000000000
export const getRelationship = (req: Request, res: Response) => {
    const { sourceUserId, targetUserId } = req.params;
    const { page } = req.query;

    // hasPermissionsToView()??
    // ^ isBlocked(); built-in

    const followsResult = db.interactions.query(
        `SELECT * FROM follows WHERE source = ? AND target = ?`, 
        [sourceUserId, targetUserId]
    );

    const friendsResult = db.interactions.query(
        `SELECT * FROM friends WHERE source = ? AND target = ?`, 
        [sourceUserId, targetUserId]
    );

    if (!followsResult.success && friendsResult.success) return res.status(500).json({ error: "An error occurred while fetching interaction" });
    if (followsResult.rowCount < 1 && friendsResult.rowCount < 1) return res.status(404).json({ error: "Interaction not found" });

    res.status(200).json({
        follows: followsResult.rows,
        friends: friendsResult.rows
    });

  //  {
  //"sourceUserId": "5719552362357773",
  //"targetUserId": "1844584278027570",
 // "following": true,
 /// "followedBy": false,
//  "friends": false
// blocked etc
//}
};



export const postInteraction = (req: Request, res: Response) => {};

// update this controller to take each path individually
// https://api.openprofile.app/v2/interactions/follows -> body: { target: "5019646586243236" }