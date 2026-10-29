import { Router } from "express";

import { postRegisterController } from "../controllers/postRegister.controller.js";

const postRegisterRoute = Router();

postRegisterRoute.post("/", postRegisterController);

export default postRegisterRoute;
