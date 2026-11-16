import { Router } from "express";

import { postInteractionController } from "../controllers/interactions/postInteraction.controller.js";
import { getRandomInteractionController } from "../controllers/interactions/getRandomInteraction.controller.js";
import { removeFollowerController } from "../controllers/interactions/removeFollower.controller.js";

const interactionRoutes = Router();

interactionRoutes.post("/", postInteractionController);
interactionRoutes.get("/random/:type/:count", getRandomInteractionController);
interactionRoutes.get("/remove-follower/:targetId", removeFollowerController);

export default interactionRoutes;
