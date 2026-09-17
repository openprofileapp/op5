import { Router } from "express";

import { templateBlockController } from "../controllers/templates/block.controller.js";
import { templateDataController } from "../controllers/templates/data.controller.js";

const templateRoutes = Router();

templateRoutes.get("/blocks", templateBlockController);
templateRoutes.get("/data/:blockId", templateDataController);

export default templateRoutes;
