import type { Request, Response } from 'express';

import { AdvancedError } from 'kage-library';

import { log } from '../instances.js';
import getAllUsers from '../services/getAllUsers.service.js';
import getUsersByIdOrUsername from '../services/getUsersByIdOrUsername.service.js';

export const getUsers = (req: Request, res: Response) => {
    try {
        const { id } = req.query;

        if (id) {
            if (typeof id !== 'string') {
                return res.status(400).json({
                    error: 'Invalid user id'
                });
            }

            res.status(200).json({
                ...getUsersByIdOrUsername(id)
            });
        } else  {
            res.status(200).json(getAllUsers());
        }
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
        }
    }
};