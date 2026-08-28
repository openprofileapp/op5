import { Router } from "express";

import { getPins } from "../controllers/pins/getPins.controller.js";
import { postPins } from "../controllers/pins/postPins.controller.js";
import { deletePins } from "../controllers/pins/deletePins.controller.js";

const userRoute = Router();

userRoute.get("/:ownerId", getPins)
userRoute.post("/:ownerId/:assetId", postPins)
userRoute.delete("/:ownerId/:assetId", deletePins)

export default userRoute;
