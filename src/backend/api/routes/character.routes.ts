import { Router } from "express";

import { getCharacters } from "../controllers/character.controller.js";
import { getRecommendedCharacters } from "../controllers/characters/getRecommendedCharacters.controller.js";
import { getPopularCharacters } from "../controllers/characters/getPopularCharacters.controller.js";

const characterRoutes = Router();

// DEVELOPER NEEDED: Add "page" query which has 30 items per

// On front page, replace popular with trending; trending is top 100 with the most interactions within the past 24 hours
// Add "getTrendingCharacters"
characterRoutes.get("/", getCharacters);
characterRoutes.get("/recommended", getRecommendedCharacters);
characterRoutes.get("/popular", getPopularCharacters);
characterRoutes.get("/trending", getCharacters);
characterRoutes.get("/tag/:tag", getCharacters);

export default characterRoutes;
