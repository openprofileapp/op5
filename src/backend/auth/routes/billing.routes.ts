import { Router } from "express";

import { subscribeController } from "../controllers/billing/subscribe.controller.js";
import { unsubscribeController } from "../controllers/billing/unsubscribe.controller.js";
import { webhookController } from "../controllers/billing/webhook.controller.js";
import { getSubscriptionsController } from "../controllers/billing/getSubscriptions.controller.js";
import { getPartnerEarningsController } from "../controllers/billing/getPartnerEarnings.controller.js";
import { getSubscriptionController } from "../controllers/billing/getSubscription.controller.js";
import { getOldestStartDateController } from "../controllers/billing/getOldestStartDate.controller.js";

const billingRoutes = Router();

billingRoutes.get("/subscribe", subscribeController);
billingRoutes.post("/unsubscribe", unsubscribeController);
billingRoutes.post("/webhook", webhookController);
billingRoutes.post("/get", getSubscriptionsController);
billingRoutes.get("/earnings/:userId", getPartnerEarningsController);
billingRoutes.get("/subscription", getSubscriptionController);
billingRoutes.get("/subscriptions/date/:userId", getOldestStartDateController);

export default billingRoutes;
