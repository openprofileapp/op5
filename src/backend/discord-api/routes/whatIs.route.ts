import { Router } from "express";

import { whatIsController } from "../controllers/whatIs.controller.js";

const whatIsRoute = Router();

whatIsRoute.get("/:id", whatIsController);

export default whatIsRoute;
