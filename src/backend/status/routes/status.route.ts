import { Router } from 'express';

import { statusController } from '../controllers/status.controller.js';

const statusRoute = Router();

statusRoute.get('/', statusController);

export default statusRoute;