import { Router } from "express";

import { connectSessionController } from "../../controllers/connection/connect.controller.js";

const connectRoute = Router();

connectRoute.get("/:sessionId", connectSessionController);

export default connectRoute;
