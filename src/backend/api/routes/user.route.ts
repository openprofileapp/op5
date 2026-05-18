import { Router } from 'express';
import { getUsers } from '../controllers/user.controller.js';

const userRoute = Router();

userRoute.get('/', getUsers);

export default userRoute;