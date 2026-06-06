import type { Request, Response } from 'express';

import getPublicUserByIdOrUsername from '../services/getPublicUserByIdOrUsername.service.js';
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
            ...getPublicUserByIdOrUsername(id)
        });
    } else  {
        res.json(getAllUsers());
    }
};