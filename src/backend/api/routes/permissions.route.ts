import { Router } from "express";

import { permissionsController } from "../controllers/permissions.controller.js";

const permissionsRoute = Router();

permissionsRoute.get("/:permissions", permissionsController);

export default permissionsRoute;
