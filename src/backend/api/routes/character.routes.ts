import { Router } from "express";

import { getPublishedCharacters } from "../controllers/characters/getPublishedCharacters.controller.js";
import { getTrendingPublishedCharacters } from "../controllers/characters/getTrendingPublishedCharacters.controller.js";
import { getPopularPublishedCharacters } from "../controllers/characters/getPopularPublishedCharacters.controller.js";
import { getRecentPublishedCharacters } from "../controllers/characters/getRecentPublishedCharacters.controller.js";
import { getTaggedPublishedCharacters } from "../controllers/characters/getTaggedPublishedCharacters.controller.js";
import { getRecentFollowingPublishedCharacters } from "../controllers/users/getRecentFollowingCharacters.controller.js";
import { getRecommendedPublishedCharacters } from "../controllers/characters/getRecommendedPublishedCharacters.controller.js";
import { getRecommendedTaggedPublishedCharacters } from "../controllers/characters/getRecommendedTaggedPublishedCharacters.controller.js";

const characterRoutes = Router();

characterRoutes.get("/", getPublishedCharacters);
characterRoutes.get("/trending", getTrendingPublishedCharacters);
characterRoutes.get("/popular", getPopularPublishedCharacters);
characterRoutes.get("/recent", getRecentPublishedCharacters);
characterRoutes.get("/tag/:tag", getTaggedPublishedCharacters);
characterRoutes.get("/recent/following", getRecentFollowingPublishedCharacters);
characterRoutes.get("/recommended", getRecommendedPublishedCharacters);
characterRoutes.get("/recommended/:tag", getRecommendedTaggedPublishedCharacters);

export default characterRoutes;
