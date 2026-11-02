import { Router } from "express";

import { newAccountController } from "../controllers/notifications/accounts/newAccount.controller.js";
import { newSubscriptionController } from "../controllers/notifications/subscriptions/newSubscription.controller.js";
import { canceledSubscriptionController } from "../controllers/notifications/subscriptions/canceledSubscription.controller.js";
import { refundedSubscriptionController } from "../controllers/notifications/subscriptions/refundedSubscription.controller.js";
import { suspendedSubscriptionController } from "../controllers/notifications/subscriptions/suspendedSubscription.controller.js";
import { reactivatedSubscriptionController } from "../controllers/notifications/subscriptions/reactivatedSubscription.controller.js";

const notificationRoutes = Router();

notificationRoutes.post("/accounts/new", newAccountController);

notificationRoutes.post("/subscriptions/new", newSubscriptionController);
notificationRoutes.post("/subscriptions/canceled", canceledSubscriptionController);
notificationRoutes.post("/subscriptions/refunded", refundedSubscriptionController);
notificationRoutes.post("/subscriptions/suspended", suspendedSubscriptionController);
notificationRoutes.post("/subscriptions/reactivated", reactivatedSubscriptionController);

export default notificationRoutes;
