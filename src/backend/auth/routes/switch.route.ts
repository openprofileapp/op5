import { Router } from "express";

import { switchAccountController } from "../controllers/login/switchAccount.controller.js";

const switchRoutes = Router();

switchRoutes.get("/:userId", switchAccountController);

export default switchRoutes;
