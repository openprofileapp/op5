import { Router } from "express";

import { getCollectionsController } from "../controllers/collections/getCollections.controller.js";

const collectionRoutes = Router();

collectionRoutes.get("/", getCollectionsController);

export default collectionRoutes;
