import { Router } from "express";

import { suspendAccountController } from "../controllers/suspendAccount.controller.js";
import { unsuspendAccountController } from "../controllers/unsuspendAccount.controller.js";

const suspendRoutes = Router();

suspendRoutes.get("/suspend/:userId", suspendAccountController);
suspendRoutes.get("/unsuspend/:userId", unsuspendAccountController);

export default suspendRoutes;
