import { Router } from 'express';
import { getSession } from '../controllers/session.controller.js';

const sessionRoutes = Router();

sessionRoutes.get('/', getSession);
sessionRoutes.post('/', getSession);

export default sessionRoutes;