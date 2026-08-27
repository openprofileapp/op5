import { Router } from "express";

import { webPushController } from "../controllers/webpush.controller.js";

const webPushRoute = Router();

webPushRoute.post("/", webPushController);

export default webPushRoute;
