import { Router } from "express";
import { botLoginController } from "../controllers/login/botLogin.controller.js";
import { googleLoginController } from "../controllers/login/googleLogin.controller.js";

const loginRoutes = Router();

loginRoutes.post("/bot", botLoginController);
loginRoutes.get("/google", googleLoginController);

export default loginRoutes;
