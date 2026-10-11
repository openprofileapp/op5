import { Router } from "express";

import { updateRoleController } from "../controllers/updateRole.controller.js";

const rolesRoute = Router();

rolesRoute.get("/:discordUserId/:action/:roleId", updateRoleController);

export default rolesRoute;
