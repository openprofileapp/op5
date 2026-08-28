import { Router } from "express";

import { postInteractionController } from "../controllers/interactions/postInteraction.controller.js";
import { getRandomInteractionController } from "../controllers/interactions/getRandomInteraction.controller.js";

const interactionRoutes = Router();

interactionRoutes.post("/", postInteractionController);

interactionRoutes.get("/random/:type/:count", getRandomInteractionController);

export default interactionRoutes;
