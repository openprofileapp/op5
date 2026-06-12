import { Router } from "express";
import { getInteractionsCount } from "../controllers/interactions.controller.js";

const interactionRoutes = Router();

interactionRoutes.get("/:userId", getInteractionsCount);

// interactionRoutes.get("/:userId/following", getFollowing);
// interactionRoutes.get("/:userId/followers", getFollowers);

// interactionRoutes.get("/:sourceUserId/relationship/:targetUserId", getRelationship);
// interactionRoutes.post("/:user/", postInteraction);

export default interactionRoutes;