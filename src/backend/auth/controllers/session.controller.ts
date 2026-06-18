import type { Request, Response } from 'express';

export const authenticateSession = async (req: Request, res: Response) => {
    return res.status(200).json(
        {...req.session}
    );
};