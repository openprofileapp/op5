import { Router } from "express";

import { getPublishedTemplateDataController } from "../controllers/templates/getPublishedTemplateData.controller.js";
import { getDraftDatasetController } from "../controllers/datasets/getDraftDatasets.controller.js";
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
import { getPublishedTemplatesController } from "../controllers/templates/getPublishedTemplates.controller.js";
import { getDraftTemplatesController } from "../controllers/templates/getDraftTemplates.controller.js";
import { getDraftTemplateDataController } from "../controllers/templates/getDraftTemplateData.controller.js";
import { getPublishedDatasetController } from "../controllers/datasets/getPublishedDatasets.controller.js";
import { updateCategories } from "../controllers/templates/updates/categories/updateCategory.controller.js";
import { restoreTemplate } from "../controllers/templates/restore.controller.js";
import { trashTemplete } from "../controllers/templates/trash.controller.js";
import { deleteTemplete } from "../controllers/templates/delete.controller.js";
import { updateBlocks } from "../controllers/templates/updates/blocks/updateBlocks.controller.js";
import { publishDatasetController } from "../controllers/datasets/publishDataset.controller.js";
import { unpublishDatasetController } from "../controllers/datasets/unpublishDataset.controller.js";
import { randomizeDataset } from "../controllers/datasets/randomizeDataset.controller.js";
import { getCategoriesDataset } from "../controllers/datasets/getCategoriesDataset.controller.js";
import { updateTemplates } from "../controllers/templates/updateTemplates.controller.js";
import { publishTemplateController } from "../controllers/templates/publishTemplate.controller.js";
import { unpublishTemplateController } from "../controllers/templates/unpublishTemplate.controller.js";

const templateRoutes = Router();

templateRoutes.get("/", getPublishedTemplatesController);
templateRoutes.get("/drafts", getDraftTemplatesController);

templateRoutes.get("/:id/data", getPublishedTemplateDataController);
templateRoutes.get("/drafts/:id/data", getDraftTemplateDataController);

templateRoutes.get("/datasets", getPublishedDatasetController);
templateRoutes.get("/datasets/drafts", getDraftDatasetController);

templateRoutes.post("/datasets/update/:id", updateDatasetController);
templateRoutes.post("/datasets/insert", insertDatasetController);
templateRoutes.delete("/datasets/delete/:id", deleteDatasetController);
templateRoutes.get("/datasets/publish/:id", publishDatasetController);
templateRoutes.get("/datasets/unpublish/:id", unpublishDatasetController);
templateRoutes.get("/datasets/randomize/:id", randomizeDataset);
templateRoutes.get("/datasets/randomize/:id/:category", randomizeDataset);
templateRoutes.get("/datasets/categories/:id", getCategoriesDataset);

templateRoutes.get("/restore/:id", restoreTemplate);
templateRoutes.get("/trash/:id", trashTemplete);
templateRoutes.delete("/delete/:id", deleteTemplete);
templateRoutes.get("/publish/:id", publishTemplateController);
templateRoutes.get("/unpublish/:id", unpublishTemplateController);
templateRoutes.post("/update/:templateId", updateTemplates);

templateRoutes.post("/:templateId/categories/insert", insertCategories);
templateRoutes.post("/:templateId/categories/update", updateCategories);
templateRoutes.post("/:templateId/categories/update/positions", positionCategories);
templateRoutes.delete("/:templateId/categories/delete/:categoryId", deleteCategories);

templateRoutes.post("/:templateId/blocks/insert", insertBlock);
templateRoutes.post("/:templateId/blocks/update", updateBlocks);
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
