import type { Request, Response } from 'express';

import getPublicUserById from '../services/getPublicUserById.service.js';
import getPublicUsers from '../services/getPublicUsers.service.js';

export const getUsers = (req: Request, res: Response) => {
    const { id, visibility } = req.query;

    if (id) {
        if (typeof id !== 'string') {
            return res.status(400).json({
                error: 'Invalid id'
            });
        }

        res.json({
            ...getPublicUserById(id)
        });
    } else if (visibility) {
        if (typeof visibility !== 'string') {
            return res.status(400).json({
                error: 'Invalid visibility'
            });
        }

        res.json(getPublicUsers(visibility));
    }
};