import { Router } from "express";

import { updateNotficationsController } from "../controllers/notifications/update.controller.js";

const notificationRoutes = Router();

notificationRoutes.post("/update/:type/:id", updateNotficationsController);

export default notificationRoutes;
