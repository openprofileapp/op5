import { Router } from "express";

import { logoutController } from "../controllers/logout.controller.js";

const logoutRoute = Router();

logoutRoute.get("/", logoutController);

export default logoutRoute;
