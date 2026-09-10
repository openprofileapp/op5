import { Router } from "express";

import { advertisementsController } from "../controllers/advertisements/getAdvertisement.controller.js";
import { assignClickController } from "../controllers/advertisements/assignClick.controller.js";

const advertisementRoute = Router();

advertisementRoute.get("/", advertisementsController);
advertisementRoute.get("/click/:id", assignClickController);

export default advertisementRoute;
