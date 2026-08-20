import { Router } from "express";

import { getCharacters } from "../controllers/character.controller.js";
import { getRecentFollowingCharacters } from "../controllers/characters/getRecentFollowingCharacters.controller.js";
import { getRecommendedCharacters } from "../controllers/characters/getRecommendedCharacters.controller.js";
import { getRecommendedTaggedCharacters } from "../controllers/characters/getRecommendedTaggedCharacters.controller.js";
import { getPopularCharacters } from "../controllers/characters/getPopularCharacters.controller.js";
import { getTrendingCharacters } from "../controllers/characters/getTrendingCharacters.controller.js";
import { getRecentCharacters } from "../controllers/characters/getRecentCharacters.controller.js";
import { getTaggedCharacters } from "../controllers/characters/getTaggedCharacters.controller.js";

const characterRoutes = Router();

// DEVELOPER NEEDED: Add "page" query which has 30 items per

characterRoutes.get("/", getCharacters);
characterRoutes.get("/recent/following", getRecentFollowingCharacters);
characterRoutes.get("/recommended", getRecommendedCharacters);
characterRoutes.get("/recommended/:tag", getRecommendedTaggedCharacters);
characterRoutes.get("/popular", getPopularCharacters);
characterRoutes.get("/trending", getTrendingCharacters);
characterRoutes.get("/recent", getRecentCharacters);
characterRoutes.get("/tag/:tag", getTaggedCharacters);

export default characterRoutes;
