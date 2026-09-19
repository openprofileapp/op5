import { Router } from "express";

import { templateBlockController } from "../controllers/templates/block.controller.js";
import { templateDataController } from "../controllers/templates/data.controller.js";
import { getDatasetController } from "../controllers/templates/datasets/getDatasets.controller.js";
import { updateDatasetController } from "../controllers/templates/datasets/updateDataset.controller.js";
import { insertDatasetController } from "../controllers/templates/datasets/insertDataset.controller.js";
import { deleteDatasetController } from "../controllers/templates/datasets/deleteDataset.controller.js";

const templateRoutes = Router();

templateRoutes.get("/blocks", templateBlockController);
templateRoutes.get("/data/:blockId", templateDataController);

templateRoutes.get("/datasets", getDatasetController);
templateRoutes.post("/datasets/update/:id", updateDatasetController);
templateRoutes.post("/datasets/insert", insertDatasetController);
templateRoutes.delete("/datasets/delete/:id", deleteDatasetController);

export default templateRoutes;
