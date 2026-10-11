import { Router } from "express";

import { discordLinkedRolesController } from "../controllers/connection/discordLinkedRoles.controller.js";

const integrationRoute = Router();

integrationRoute.get("/discord", discordLinkedRolesController);

export default integrationRoute;
