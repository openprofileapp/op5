import { Router } from "express";

import { switchAccountController } from "../controllers/switchAccount.controller.js";

const switchRoutes = Router();

switchRoutes.get("/:userId", switchAccountController);

export default switchRoutes;
