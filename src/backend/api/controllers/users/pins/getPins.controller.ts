import type { Request, Response } from 'express';

import { AdvancedError } from 'kage-library';

import { log } from '../../../instances.js';
import getPinsByOwnerId from '../../../services/getPinsByOwnerId.service.js';

export const getPins = (req: Request, res: Response) => {
    try {
        const { ownerId } = req.params;

        res.status(200).json({
            ...getPinsByOwnerId(ownerId as string)
        });
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