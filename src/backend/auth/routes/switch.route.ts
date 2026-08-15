import { Router } from "express";

import { switchAccount } from "../controllers/login/switchAccount.controller.js";

const switchRoutes = Router();

switchRoutes.get("/:userId", switchAccount);

export default switchRoutes;
