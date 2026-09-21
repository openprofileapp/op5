import { Router } from "express";

import { getPublishedCharacters } from "../controllers/characters/getPublishedCharacters.controller.js";
import { getDraftCharacters } from "../controllers/characters/getDraftCharacters.controller.js";
import { getTrendingPublishedCharacters } from "../controllers/characters/getTrendingPublishedCharacters.controller.js";
import { getPopularPublishedCharacters } from "../controllers/characters/getPopularPublishedCharacters.controller.js";
import { getRecentPublishedCharacters } from "../controllers/characters/getRecentPublishedCharacters.controller.js";
import { getTaggedPublishedCharacters } from "../controllers/characters/getTaggedPublishedCharacters.controller.js";
import { getRecentFollowingPublishedCharacters } from "../controllers/characters/getRecentFollowingPublishedCharacters.controller.js";
import { getRecommendedPublishedCharacters } from "../controllers/characters/getRecommendedPublishedCharacters.controller.js";
import { getRecommendedTaggedPublishedCharacters } from "../controllers/characters/getRecommendedTaggedPublishedCharacters.controller.js";
import { insertBlock } from "../controllers/characters/updates/blocks/insertBlock.controller.js";
import { positionBlocks } from "../controllers/characters/updates/blocks/positionBlocks.controller.js";
import { deleteBlock } from "../controllers/characters/updates/blocks/deleteBlock.controller.js";
import { insertCategories } from "../controllers/characters/updates/categories/insertCategory.controller.js";
import { positionCategories } from "../controllers/characters/updates/categories/positionCategory.controller.js";
import { deleteCategories } from "../controllers/characters/updates/categories/deleteCategory.controller.js";
import { insertRows } from "../controllers/characters/updates/rows/insertRow.controller.js";
import { positionRows } from "../controllers/characters/updates/rows/positionRow.controller.js";
import { deleteRows } from "../controllers/characters/updates/rows/deleteRow.controller.js";
import { insertFields } from "../controllers/characters/updates/fields/insertField.controller.js";
import { positionFields } from "../controllers/characters/updates/fields/positionField.controller.js";
import { deleteFields } from "../controllers/characters/updates/fields/deleteField.controller.js";
import { restoreCharacter } from "../controllers/characters/restore.controller.js";
import { trashCharacter } from "../controllers/characters/trash.controller.js";
import { deleteCharacter } from "../controllers/characters/delete.controller.js";

const characterRoutes = Router();

characterRoutes.get("/", getPublishedCharacters);
characterRoutes.get("/drafts", getDraftCharacters);

characterRoutes.get("/trending", getTrendingPublishedCharacters);
characterRoutes.get("/popular", getPopularPublishedCharacters);
characterRoutes.get("/recent", getRecentPublishedCharacters);
characterRoutes.get("/tag/:tag", getTaggedPublishedCharacters);
characterRoutes.get("/recent/following", getRecentFollowingPublishedCharacters);
characterRoutes.get("/recommended", getRecommendedPublishedCharacters);
characterRoutes.get("/recommended/:tag", getRecommendedTaggedPublishedCharacters);

characterRoutes.get("/restore/:id", restoreCharacter);
characterRoutes.get("/trash/:id", trashCharacter);
characterRoutes.delete("/delete/:id", deleteCharacter);

characterRoutes.post("/insert/:assetId/categories", insertCategories);
characterRoutes.post("/update/:assetId/categories/positions", positionCategories);
characterRoutes.post("/delete/:assetId/categories/:categoryId", deleteCategories);

characterRoutes.post("/insert/:assetId/blocks", insertBlock);
characterRoutes.post("/update/:assetId/blocks/positions", positionBlocks);
characterRoutes.post("/delete/:assetId/blocks/:assetId", deleteBlock);

characterRoutes.post("/insert/:assetId/rows", insertRows);
characterRoutes.post("/update/:assetId/rows/positions", positionRows);
characterRoutes.post("/delete/:assetId/rows/:rowId", deleteRows);

characterRoutes.post("/insert/:assetId/fields", insertFields);
characterRoutes.post("/update/:assetId/fields/positions", positionFields);
characterRoutes.post("/delete/:assetId/fields/:fieldId", deleteFields);

export default characterRoutes;
