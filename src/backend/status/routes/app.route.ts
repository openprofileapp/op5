import { Router } from 'express';

import { renderApp } from '../controllers/app.controller.js';

const appRoute = Router();

appRoute.get(/.*/, renderApp);

export default appRoute;