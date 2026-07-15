import { Router } from "express";

import { getPins } from "../controllers/users/pins/getPins.controller.js";
import { postPins } from "../controllers/users/pins/postPins.controller.js";

const userRoute = Router();

userRoute.get("/:ownerId", getPins)
userRoute.post("/:ownerId/:assetId", postPins)

export default userRoute;