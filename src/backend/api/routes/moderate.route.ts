import { Router } from "express";

import { moderateController } from "../controllers/moderate.controller.js";
import { moderateHistoryController } from "../controllers/moderateHistory.controller.js";

const moderateRoute = Router();

moderateRoute.get("/history", moderateHistoryController);
moderateRoute.post("/", moderateController);

export default moderateRoute;
