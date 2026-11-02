import { Router } from "express";

import { updatePermissionsController } from "../controllers/updatePermissions.controller.js";

const permissionsRoute = Router();

permissionsRoute.get("/:id/:action/:role", updatePermissionsController);

export default permissionsRoute;
