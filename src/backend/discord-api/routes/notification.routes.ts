import { Router } from "express";

import { newAccountController } from "../controllers/notifications/newAccount.controller.js";

const notificationRoutes = Router();

notificationRoutes.post("/accounts/new", newAccountController);

export default notificationRoutes;
