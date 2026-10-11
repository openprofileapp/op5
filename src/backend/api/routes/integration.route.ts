import { Router } from "express";

import { getIntegrationMetadataController } from "../controllers/integration.controller.js";

const integrationRoute = Router();

integrationRoute.get("/metadata/:userId", getIntegrationMetadataController);

export default integrationRoute;
