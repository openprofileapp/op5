import { Router } from 'express';
import { getSession } from '../controllers/session.controller.js';

const sessionRoute = Router();

sessionRoute.get('/', getSession);

export default sessionRoute;

// MAYBE DELETE THIS AND ONLY RUN ON INTERNAL CALLS USING WEBSOCKET???