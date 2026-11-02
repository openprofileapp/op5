import { Router } from "express";

import { postRegisterController } from "../controllers/postRegister.controller.js";
import { postSubscribeController } from "../controllers/postSubscribe.controller.js";
import { postUnsubscribeController } from "../controllers/postUnsubscribe.controller.js";

const postRoutes = Router();

postRoutes.post("/register", postRegisterController);
postRoutes.post("/subscribe", postSubscribeController);
postRoutes.post("/unsubscribe", postUnsubscribeController);

export default postRoutes;
