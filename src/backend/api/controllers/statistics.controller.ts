import type { Request, Response } from 'express';

import { db } from '../server.js';

export const getStatistics = (req: Request, res: Response) => {
    const { id } = req.params;

    // MOVE MOST OF THIS TO AN EXTERNAL SERVICE THEN CALL IT HERE
    // RENAME TO /STATS OR SOMETHING

    // hasPermissionsToView()??
    // ^ isBlocked(); built-in

    // ONLY INCLUDE BLOCKS/FRIENDS/MUTES/RESTRICTS AND STUFF IF ITS THE OWNER OF THE ACCOUNT/ASSET

    /* 
    ————————————————————————————————————————————————————————————————
    userProfileCounts
    ———————————————————————————————————————————————————————————————— 
    */

    // Following
    const userProfileFollowingResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM follows WHERE sourceId = ?`, 
        [id]
    );

    if (!userProfileFollowingResult.success) return res.status(500).json(
        { error: "An error occurred while fetching following" }
    );

    // Followers
    const userProfileFollowersResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM follows WHERE targetId = ?`, 
        [id]
    );

    if (!userProfileFollowersResult.success) return res.status(500).json(
        { error: "An error occurred while fetching followers" }
    );

    // Shares
    const userProfileSharesResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM shares WHERE targetId = ?`, 
        [id]
    );

    if (!userProfileSharesResult.success) return res.status(500).json(
        { error: "An error occurred while fetching shares" }
    );

    // Views
    const userProfileViewsResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM views WHERE targetId = ?`, 
        [id]
    );

    if (!userProfileViewsResult.success) return res.status(500).json(
        { error: "An error occurred while fetching views" }
    );

    /* 
    ————————————————————————————————————————————————————————————————
    contentCounts
    ———————————————————————————————————————————————————————————————— 
    */

    const characterIdsResult = db.characters.query(
        "SELECT id FROM published WHERE ownerId = ?", 
        [id]
    );

    if (!characterIdsResult.success) return res.status(500).json(
        { error: "An error occurred while fetching characters" }
    );
    
    const characterIds = (characterIdsResult.rows as { id: string }[]).map(c => c.id);
    
    // Followers
    const contentFollowersResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM follows WHERE targetId IN (
            ${characterIds.map(() => "?").join(",")}
        )`, 
        characterIds
    );
    
    if (!contentFollowersResult.success) return res.status(500).json(
        { error: "An error occurred while fetching followers" }
    );

    // Likes
    const contentLikesResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM likes WHERE targetId IN (
            ${characterIds.map(() => "?").join(",")}
        )`, 
        characterIds
    );
    
    if (!contentLikesResult.success) return res.status(500).json(
        { error: "An error occurred while fetching likes" }
    );

    // Reads
    const contentReadsResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM reads WHERE targetId IN (
            ${characterIds.map(() => "?").join(",")}
        )`, 
        characterIds
    );
    
    if (!contentReadsResult.success) return res.status(500).json(
        { error: "An error occurred while fetching reads" }
    );

    // Shares
    const contentSharesResult = db.interactions.query(
        `SELECT COUNT(*) AS count FROM shares WHERE targetId IN (
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
        `SELECT COUNT(*) AS count FROM views WHERE targetId IN (
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
        id,
        userProfileCounts: {
            following: userProfileFollowingResult.rows[0].count || 0,
            followers: userProfileFollowersResult.rows[0].count || 0,
            shares: userProfileSharesResult.rows[0].count || 0,
            views: userProfileViewsResult.rows[0].count || 0
        },
        contentCounts: {
            followers: contentFollowersResult.rows[0].count || 0,
            likes: contentLikesResult.rows[0].count || 0,
            reads: contentReadsResult.rows[0].count || 0,
            shares: contentSharesResult.rows[0].count || 0,
            views: contentViewsResult.rows[0].count || 0
        }
    });
};