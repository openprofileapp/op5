import { Router } from 'express';
import { getInteraction, postInteraction } from '../controllers/interactions.controller.js';

const interactionRoutes = Router();

interactionRoutes.get('/:interaction', getInteraction);
interactionRoutes.post('/:interaction', postInteraction);

export default interactionRoutes;