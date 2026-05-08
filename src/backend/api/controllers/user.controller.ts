import type { Request, Response } from 'express';

import getUserById from '../services/getUser.service.js';

export const getUsers = (req: Request, res: Response) => {
    res.json({ message: 'Get all users' });
};

export const getUser = (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ message: getUserById(id) });
};

export const createUser = (req: Request, res: Response) => {
    const body = req.body;
    res.status(201).json({ message: 'User created', data: body });
};