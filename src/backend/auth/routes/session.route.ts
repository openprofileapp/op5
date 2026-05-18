import { Router } from 'express';
import { getSession } from '../controllers/session.controller.js';

const sessionRoute = Router();

sessionRoute.get('/', getSession);

export default sessionRoute;