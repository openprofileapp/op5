import { Router } from "express";

import { newAccountController } from "../controllers/notifications/accounts/newAccount.controller.js";
import { newSubscriptionController } from "../controllers/notifications/subscriptions/newSubscription.controller.js";
import { canceledSubscriptionController } from "../controllers/notifications/subscriptions/canceledSubscription.controller.js";

const notificationRoutes = Router();

notificationRoutes.post("/accounts/new", newAccountController);

notificationRoutes.post("/subscriptions/new", newSubscriptionController);
notificationRoutes.post("/subscriptions/canceled", canceledSubscriptionController);

export default notificationRoutes;
