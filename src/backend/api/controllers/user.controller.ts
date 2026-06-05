import type { Request, Response } from 'express';

import getPublicUserById from '../services/getPublicUserById.service.js';
import getAllUsers from '../services/getAllUsers.service.js';

export const getUsers = (req: Request, res: Response) => {
    const { id } = req.query;

    if (id) {
        if (typeof id !== 'string') {
            return res.status(400).json({
                error: 'Invalid user id'
            });
        }

        res.json({
            ...getPublicUserById(id)
        });
    } else  {
        res.json(getAllUsers());
    }
};