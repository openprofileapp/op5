import { Router } from 'express';

import { websocketController } from '../controllers/websocket.controller.js';

const websocketRoute = Router();

websocketRoute.post("/", websocketController);

export default websocketRoute;
