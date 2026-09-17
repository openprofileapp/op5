import { Router } from "express";

import { templateBlockController } from "../controllers/templates/block.controller.js";
import { templateRowController } from "../controllers/templates/row.controller.js";

const templateRoutes = Router();

templateRoutes.get("/blocks", templateBlockController);
templateRoutes.get("/rows/:blockId", templateRowController);

export default templateRoutes;
