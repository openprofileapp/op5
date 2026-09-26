import { Router } from "express";

import { templateBlockController } from "../controllers/blocks/getBlocks.controller.js";
import { templateBlockDataController } from "../controllers/blocks/getBlockData.controller.js";
import { getTemplatesController } from "../controllers/templates/getTemplates.controller.js";
import { getTemplateDataController } from "../controllers/templates/getTemplateData.controller.js";
import { getDatasetController } from "../controllers/datasets/getDatasets.controller.js";
import { updateDatasetController } from "../controllers/datasets/updateDataset.controller.js";
import { insertDatasetController } from "../controllers/datasets/insertDataset.controller.js";
import { deleteDatasetController } from "../controllers/datasets/deleteDataset.controller.js";
import { insertBlock } from "../controllers/templates/updates/blocks/insertBlock.controller.js";
import { positionBlocks } from "../controllers/templates/updates/blocks/positionBlocks.controller.js";
import { deleteBlock } from "../controllers/templates/updates/blocks/deleteBlock.controller.js";
import { insertCategories } from "../controllers/templates/updates/categories/insertCategory.controller.js";
import { positionCategories } from "../controllers/templates/updates/categories/positionCategory.controller.js";
import { deleteCategories } from "../controllers/templates/updates/categories/deleteCategory.controller.js";
import { insertRows } from "../controllers/templates/updates/rows/insertRow.controller.js";
import { positionRows } from "../controllers/templates/updates/rows/positionRow.controller.js";
import { deleteFields } from "../controllers/templates/updates/fields/deleteField.controller.js";
import { insertFields } from "../controllers/templates/updates/fields/insertField.controller.js";
import { positionFields } from "../controllers/templates/updates/fields/positionField.controller.js";
import { deleteRows } from "../controllers/templates/updates/rows/deleteRow.controller.js";
import { updateValue } from "../controllers/templates/updates/updateValue.controller.js";
import { updateFields } from "../controllers/templates/updates/fields/updateField.controller.js";

const templateRoutes = Router();

templateRoutes.get("/", getTemplatesController);
templateRoutes.get("/:id/data", getTemplateDataController);
templateRoutes.get("/blocks", templateBlockController);
templateRoutes.get("/blocks/data/:blockId", templateBlockDataController);

templateRoutes.get("/datasets", getDatasetController);
templateRoutes.post("/datasets/update/:id", updateDatasetController);
templateRoutes.post("/datasets/insert", insertDatasetController);
templateRoutes.delete("/datasets/delete/:id", deleteDatasetController);

//templateRoutes.get("/restore/:id", restoreCharacter);
//templateRoutes.get("/trash/:id", trashCharacter);
//templateRoutes.delete("/delete/:id", deleteCharacter);

templateRoutes.post("/:templateId/categories/insert", insertCategories);
templateRoutes.post("/:templateId/categories/update/positions", positionCategories);
templateRoutes.delete("/:templateId/categories/delete/:categoryId", deleteCategories);

templateRoutes.post("/:templateId/blocks/insert", insertBlock);
templateRoutes.post("/:templateId/blocks/update/positions", positionBlocks);
templateRoutes.delete("/:templateId/blocks/delete/:blockId", deleteBlock);

templateRoutes.post("/:templateId/rows/insert", insertRows);
templateRoutes.post("/:templateId/rows/update/positions", positionRows);
templateRoutes.delete("/:templateId/rows/delete/:rowId", deleteRows);

templateRoutes.post("/:templateId/fields/insert", insertFields);
templateRoutes.post("/:templateId/fields/update", updateFields);
templateRoutes.post("/:templateId/fields/update/positions", positionFields);
templateRoutes.post("/:templateId/fields/update/value", updateValue);
templateRoutes.delete("/:templateId/fields/delete/:fieldId", deleteFields);

export default templateRoutes;
