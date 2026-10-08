import { Router } from "express";

import { checkController } from "../controllers/check.controller.js";

const checkRoute = Router();

checkRoute.get("/", checkController);

export default checkRoute;
