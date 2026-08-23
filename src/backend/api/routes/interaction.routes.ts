import { Router } from "express";
import { postInteraction } from "../controllers/interactions/postInteraction.controller.js";

const interactionRoutes = Router();

interactionRoutes.post("/", postInteraction);

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
