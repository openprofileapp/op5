import type { Request, Response } from 'express';

import { db } from '../server.js';

export const getInteraction = (req: Request, res: Response) => {
    const { interaction } = req.params;
    const { source, target, page } = req.query;

    if (!source && !target) return res.status(400).json({ error: "Invalid interaction" });

    // hasPermissionsToView()??
    // ^ isBlocked(); built-in

    const conditions: string[] = [];

    if (source) conditions.push(`sourceId = ${source}`);
    if (target) conditions.push(`targetId = ${target}`);

    const result = db.interactions.query(`SELECT * FROM ${interaction} WHERE ${conditions.join(" AND ")}`);

    if (!result.success) return res.status(400).json({ error: "An error occurred while fetching interaction" });
    if (result.rowCount < 1) return res.status(404).json({ error: "Interaction not found" });

    res.status(200).json(result.rows);
};

export const postInteraction = (req: Request, res: Response) => {};

// update this controller to take each path individually
// https://api.openprofile.app/v2/interactions/follows -> body: { targetId: "5019646586243236" }