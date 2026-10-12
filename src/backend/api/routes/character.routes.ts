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
import { updateCharacters } from "../controllers/characters/updateCharacters.controller.js";
import { publishCharacterController } from "../controllers/characters/publishCharacter.controller.js";
import { unpublishCharacterController } from "../controllers/characters/unpublishCharacter.controller.js";
import { updateCategories } from "../controllers/characters/updates/categories/updateCategory.controller.js";
import { updateBlocks } from "../controllers/characters/updates/blocks/updateBlocks.controller.js";
import { updateFields } from "../controllers/characters/updates/fields/updateField.controller.js";
import { updateValue } from "../controllers/characters/updates/updateValue.controller.js";
import { getPublishedCharacterDataController } from "../controllers/characters/getPublishedCharacterData.controller.js";
import { getDraftCharacterDataController } from "../controllers/characters/getDraftCharacterData.controller.js";

const characterRoutes = Router();

characterRoutes.get("/", getPublishedCharacters);
characterRoutes.get("/drafts", getDraftCharacters);

characterRoutes.get("/:id/data", getPublishedCharacterDataController);
characterRoutes.get("/drafts/:id/data", getDraftCharacterDataController);

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
characterRoutes.get("/publish/:id", publishCharacterController);
characterRoutes.get("/unpublish/:id", unpublishCharacterController);
characterRoutes.post("/update/:id", updateCharacters);

characterRoutes.post("/:assetId/categories/insert", insertCategories);
characterRoutes.post("/:assetId/categories/update", updateCategories);
characterRoutes.post("/:assetId/categories/update/positions", positionCategories);
characterRoutes.delete("/:assetId/categories/delete/:categoryId", deleteCategories);

characterRoutes.post("/:assetId/blocks/insert", insertBlock);
characterRoutes.post("/:assetId/blocks/update", updateBlocks);
characterRoutes.post("/:assetId/blocks/update/positions", positionBlocks);
characterRoutes.delete("/:assetId/blocks/delete/:blockId", deleteBlock);

characterRoutes.post("/:assetId/rows/insert", insertRows);
characterRoutes.post("/:assetId/rows/update/positions", positionRows);
characterRoutes.delete("/:assetId/rows/delete/:rowId", deleteRows);

characterRoutes.post("/:assetId/fields/insert", insertFields);
characterRoutes.post("/:assetId/fields/update", updateFields);
characterRoutes.post("/:assetId/fields/update/positions", positionFields);
characterRoutes.post("/:assetId/fields/update/value", updateValue);
characterRoutes.delete("/:assetId/fields/delete/:fieldId", deleteFields);

export default characterRoutes;
