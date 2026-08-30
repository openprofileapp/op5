import { Router } from "express";

import { botLoginController } from "../controllers/login/bot.controller.js";
import { googleLoginController } from "../controllers/login/google.controller.js";
import { discordLoginController } from "../controllers/login/discord.controller.js";
import { githubLoginController } from "../controllers/login/github.controller.js";
import { xLoginController } from "../controllers/login/x.controller.js";

const loginRoutes = Router();

loginRoutes.post("/bot", botLoginController);
loginRoutes.get("/google", googleLoginController);
loginRoutes.get("/discord", discordLoginController);
loginRoutes.get("/github", githubLoginController);
loginRoutes.get("/x", xLoginController);

export default loginRoutes;
