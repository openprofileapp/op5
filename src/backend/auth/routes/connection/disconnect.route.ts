import { Router } from "express";

import { disconnectSessionController } from "../../controllers/connection/disconnect.controller.js";

const disconnectRoute = Router();

disconnectRoute.get("/:sessionId", disconnectSessionController);

export default disconnectRoute;
