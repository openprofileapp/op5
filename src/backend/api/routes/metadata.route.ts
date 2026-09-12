import { Router } from "express";

import { metadataController } from "../controllers/metadata.controller.js";

const metadataRoute = Router();

metadataRoute.get("/", metadataController);

export default metadataRoute;
