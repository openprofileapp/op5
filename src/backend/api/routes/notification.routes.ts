import { Router } from "express";

import { getNotificationsController } from "../controllers/getNotifications.controller.js";
import { updateNotficationsController } from "../controllers/notifications/update.controller.js";

const notificationRoutes = Router();

notificationRoutes.get("/inbox", getNotificationsController);
notificationRoutes.post("/update/:type/:id", updateNotficationsController);

export default notificationRoutes;
