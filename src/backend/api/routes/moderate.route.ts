import { Router } from "express";

import { moderateController } from "../controllers/moderate.controller.js";

const moderateRoute = Router();

moderateRoute.post("/", moderateController);

export default moderateRoute;
