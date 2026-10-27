import { Router } from "express";

import { subscribeController } from "../controllers/subscribe.controller.js";

const billingRoute = Router();

billingRoute.get("/subscribe", subscribeController);

export default billingRoute;
