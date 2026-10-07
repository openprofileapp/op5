import { Router } from "express";

import { viewInteractionController } from "../controllers/articles/viewInteraction.controller.js";
import { voteInteractionController } from "../controllers/articles/voteInteraction.controller.js";
import { feedbackInteractionController } from "../controllers/articles/feedbackInteraction.controller.js";

const articleRoutes = Router();

articleRoutes.post("/views", viewInteractionController);
articleRoutes.post("/votes", voteInteractionController);
articleRoutes.post("/feedback", feedbackInteractionController);

export default articleRoutes;
