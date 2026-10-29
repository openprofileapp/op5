import { Router } from "express";

import { subscribeController } from "../controllers/billing/subscribe.controller.js";
import { unsubscribeController } from "../controllers/billing/unsubscribe.controller.js";
import { webhookController } from "../controllers/billing/webhook.controller.js";
import { getSubscriptionsController } from "../controllers/billing/getSubscriptions.controller.js";

const billingRoutes = Router();

billingRoutes.get("/subscribe", subscribeController);
billingRoutes.get("/unsubscribe", unsubscribeController);
billingRoutes.post("/webhook", webhookController);
billingRoutes.post("/get", getSubscriptionsController);

export default billingRoutes;
