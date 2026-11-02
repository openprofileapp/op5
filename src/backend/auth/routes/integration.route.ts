import { Router } from "express";

import { discordLinkedRolesController } from "../controllers/integrations/discordLinkedRoles.controller.js";
import { getConnectedAccountController } from "../controllers/integrations/getConnectedAccount.controller.js";
import { getExternalAccountController } from "../controllers/integrations/getExternalAccount.controller.js";

const integrationRoutes = Router();

integrationRoutes.get("/discord", discordLinkedRolesController);
integrationRoutes.get("/get/internal/:type/:id", getConnectedAccountController);
integrationRoutes.get("/get/external/:type/:id", getExternalAccountController);

export default integrationRoutes;
