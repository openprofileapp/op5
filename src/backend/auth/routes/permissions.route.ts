import { Router } from "express";

import { updatePermissionsController } from "../controllers/updatePermissions.controller.js";
import { updatePermissionsArrayController } from "../controllers/updatePermissionsArray.controller.js";

const permissionsRoute = Router();

permissionsRoute.get("/:id/:action/:role", updatePermissionsController);
permissionsRoute.post("/:id/:action", updatePermissionsArrayController);

export default permissionsRoute;
