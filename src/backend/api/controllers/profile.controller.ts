import type { Request, Response } from 'express';

import getPublishedProfileById from '../services/getPublishedProfileById.service.js';
import getPublishedProfileByOwner from '../services/getPublishedProfilesByOwner.service.js';
import getPublishedProfiles from '../services/getPublishedProfiles.service.js';

export const getProfiles = (req: Request, res: Response) => {
    const { id, owner, visibility } = req.query;

    // MAYBE COMBIE FOR SMART FILTERING

    if (id) {
        if (typeof id !== 'string') {
            return res.status(400).json({
                error: 'Invalid profile id'
            });
        }

        res.status(200).json({
            ...getPublishedProfileById(id)
        });
    } else if (owner) {
        if (typeof owner !== 'string') {
            return res.status(400).json({
                error: 'Invalid owner'
            });
        }

        res.status(200).json(getPublishedProfileByOwner(owner));
    } else if (visibility) {
        if (typeof visibility !== 'string') {
            return res.status(400).json({
                error: 'Invalid visibility'
            });
        }

        res.status(200).json(getPublishedProfiles(visibility));
    }
};