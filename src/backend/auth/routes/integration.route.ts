import { Router } from "express";

import { discordLinkedRolesController } from "../controllers/integrations/discordLinkedRoles.controller.js";
import { getConnectedAccountController } from "../controllers/integrations/getConnectedAccount.controller.js";

const integrationRoute = Router();

integrationRoute.get("/discord", discordLinkedRolesController);
integrationRoute.get("/get/:type/:id", getConnectedAccountController);

export default integrationRoute;
