import type { Request, Response } from 'express';

import getPublishedProfileById from '../services/getPublishedProfileById.service.js';
import getPublishedProfiles from '../services/getPublishedProfiles.service.js';

export const getProfiles = (req: Request, res: Response) => {
    const { id, visibility } = req.query;

    if (id) {
        if (typeof id !== 'string') {
            return res.status(400).json({
                error: 'Invalid id'
            });
        }

        res.json({
            ...getPublishedProfileById(id)
        });
    } else if (visibility) {
        if (typeof visibility !== 'string') {
            return res.status(400).json({
                error: 'Invalid visibility'
            });
        }

        res.json(getPublishedProfiles(visibility));
    }
};