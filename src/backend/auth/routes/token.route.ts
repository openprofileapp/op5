import { Router } from 'express';
import { isAccessTokenValidController } from '../controllers/token.controller.js';

const tokenRoute = Router();

tokenRoute.post('/access', isAccessTokenValidController);

export default tokenRoute;
