import { Router } from "express";
import { botLogin } from "../controllers/botLogin.controller.js";
import { googleLogin } from "../controllers/login/googleLogin.controller.js";

const loginRoutes = Router();

loginRoutes.post("/bot", botLogin);
loginRoutes.get("/google", googleLogin);

export default loginRoutes;