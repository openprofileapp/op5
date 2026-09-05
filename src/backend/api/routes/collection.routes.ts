import { Router } from "express";

import { getCollectionsController } from "../controllers/collections/getCollections.controller.js";
import { addItemToCollectionController } from "../controllers/collections/addItemToCollection.controller.js";

const collectionRoutes = Router();

collectionRoutes.get("/", getCollectionsController);
collectionRoutes.get("/update/:collectionId/:assetId", addItemToCollectionController);

export default collectionRoutes;
