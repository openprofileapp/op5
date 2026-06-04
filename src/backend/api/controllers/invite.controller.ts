import type { Request, Response } from 'express';

import getInviteCodeByOwner from '../services/getInviteCodeByOwner.service.js';
import getInviteCode from '../services/getInviteCode.service.js';

export const getInvites = (req: Request, res: Response) => {
    const { owner, code } = req.query;

    if (owner) {
        if (typeof owner !== 'string') {
            return res.status(400).json({
                error: 'Invalid owner id'
            });
        }

        res.json({
            ...getInviteCodeByOwner(owner)
        });
    } else if (code) {
        if (typeof code !== 'string') {
            return res.status(400).json({
                error: 'Invalid invite code'
            });
        }

        res.json({
            ...getInviteCode(code)
        });
    }
};