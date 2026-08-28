import { Router } from "express";

import { postInteractionController } from "../controllers/interactions/postInteraction.controller.js";
import { getRandomInteractionController } from "../controllers/interactions/getRandomInteraction.controller.js";

const interactionRoutes = Router();

interactionRoutes.post("/", postInteractionController);

interactionRoutes.get("/random/:type/:count", getRandomInteractionController);

// interactionRoutes.get("/:userId", getInteractionsCount);
// interactionRoutes.get("/:userId/:interaction", getInteractionsCount);

// interactionRoutes.get("/:userId/following", getFollowing);
// interactionRoutes.get("/:userId/followers", getFollowers);

// interactionRoutes.get("/:sourceUserId/relationship/:targetUserId", getRelationship);
// interactionRoutes.post("/:userId/follow/:targetUserId", postInteraction);

// https://api.openprofile.app/v2/interactions
// Once interactions are done, connect them to the context menu.
// Ensure the interaction happens only if userId is req.session.userId

export default interactionRoutes;
