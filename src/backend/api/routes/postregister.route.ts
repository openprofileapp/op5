import { Router } from "express";

import { postregisterController } from "../controllers/postregister.controller.js";

const postregisterRoute = Router();

postregisterRoute.post("/", postregisterController);

export default postregisterRoute;
