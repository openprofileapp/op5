import { Router } from 'express';

import { redirectController } from '../controllers/redirect.controller.js';

const redirectRoute = Router();

redirectRoute.get(/.*/, redirectController);

export default redirectRoute;
