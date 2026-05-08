import { Router } from 'express';
import { getUsers, getUser, createUser } from '../controllers/user.controller.js';

const userRoutes = Router();

userRoutes.get('/', getUsers);
userRoutes.get('/:id', getUser);
userRoutes.post('/create', createUser);

export default userRoutes;