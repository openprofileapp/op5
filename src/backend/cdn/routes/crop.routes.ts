import { Router } from "express";

import { cropCircleController } from "../controllers/crop/circle.controller.js";
import { cropDuoController } from "../controllers/crop/duo.controller.js";

const cropRoutes = Router();

cropRoutes.get("/circle", cropCircleController);
cropRoutes.get("/duo", cropDuoController);

export default cropRoutes;
