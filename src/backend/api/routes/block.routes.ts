import { Router } from "express";

import { getPublishedBlocksController } from "../controllers/blocks/getPublishedBlocks.controller.js";
import { getDraftBlocksController } from "../controllers/blocks/getDraftBlocks.controller.js";
import { getPublishedBlockDataController } from "../controllers/blocks/getPublishedBlockData.controller.js";
import { getDraftBlockDataController } from "../controllers/blocks/getDraftBlockData.controller.js";
import { insertRows } from "../controllers/blocks/updates/rows/insertRow.controller.js";
import { positionRows } from "../controllers/blocks/updates/rows/positionRow.controller.js";
import { deleteRows } from "../controllers/blocks/updates/rows/deleteRow.controller.js";
import { insertFields } from "../controllers/blocks/updates/fields/insertField.controller.js";
import { updateFields } from "../controllers/blocks/updates/fields/updateField.controller.js";
import { positionFields } from "../controllers/blocks/updates/fields/positionField.controller.js";
import { updateValue } from "../controllers/blocks/updates/updateValue.controller.js";
import { deleteFields } from "../controllers/blocks/updates/fields/deleteField.controller.js";
import { insertBlock } from "../controllers/blocks/insertBlock.controller.js";
import { updateBlocks } from "../controllers/blocks/updateBlocks.controller.js";

const blockRoutes = Router();

blockRoutes.get("/", getPublishedBlocksController);
blockRoutes.get("/drafts", getDraftBlocksController);

blockRoutes.get("/:id/data", getPublishedBlockDataController);
blockRoutes.get("/drafts/:id/data", getDraftBlockDataController);

blockRoutes.post("/insert", insertBlock);
blockRoutes.post("/:blockId/update", updateBlocks);

blockRoutes.post("/:blockId/rows/insert", insertRows);
blockRoutes.post("/:blockId/rows/update/positions", positionRows);
blockRoutes.delete("/:blockId/rows/delete/:rowId", deleteRows);

blockRoutes.post("/:blockId/fields/insert", insertFields);
blockRoutes.post("/:blockId/fields/update", updateFields);
blockRoutes.post("/:blockId/fields/update/positions", positionFields);
blockRoutes.post("/:blockId/fields/update/value", updateValue);
blockRoutes.delete("/:blockId/fields/delete/:fieldId", deleteFields);

export default blockRoutes;
