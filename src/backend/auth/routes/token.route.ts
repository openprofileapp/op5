import { Router } from 'express';
import { isAccessTokenValid } from '../controllers/token.controller.js';

const tokenRoute = Router();

tokenRoute.get('/access', isAccessTokenValid);

export default tokenRoute;