import { Router } from "express";

import { getPublishedCharacters } from "../controllers/characters/getPublishedCharacters.controller.js";
import { getPopularCharacters } from "../controllers/characters/getPopularCharacters.controller.js";
import { getRecommendedCharacters } from "../controllers/characters/getRecommendedCharacters.controller.js";
import { getRecommendedTaggedCharacters } from "../controllers/characters/getRecommendedTaggedCharacters.controller.js";
import { getTrendingCharacters } from "../controllers/characters/getTrendingCharacters.controller.js";
import { getRecentCharacters } from "../controllers/characters/getRecentCharacters.controller.js";
import { getRecentFollowingCharacters } from "../controllers/characters/getRecentFollowingCharacters.controller.js";
import { getTaggedCharacters } from "../controllers/characters/getTaggedCharacters.controller.js";

const characterRoutes = Router();

// DEVELOPER NEEDED: Make it so non-public visibility can't be seen without an account and permissions/interaction check
characterRoutes.get("/", getPublishedCharacters); // Make it tailored to preferences like recommended
characterRoutes.get("/popular", getPopularCharacters);
characterRoutes.get("/recommended", getRecommendedCharacters);
characterRoutes.get("/recommended/:tag", getRecommendedTaggedCharacters);
characterRoutes.get("/trending", getTrendingCharacters);
characterRoutes.get("/recent", getRecentCharacters);
characterRoutes.get("/recent/following", getRecentFollowingCharacters);
characterRoutes.get("/tag/:tag", getTaggedCharacters); // Make it tailored to preferences like recommended

export default characterRoutes;
