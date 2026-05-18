import type { Request, Response } from 'express';

export const getSession = (req: Request, res: Response) => {
    return res.status(400).json({
        error: 'Invalid id'
    });
};