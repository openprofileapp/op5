import { Router } from "express";

import { usernamesController } from "../controllers/usernames.controller.js";

const usernamesRoute = Router();

usernamesRoute.post("/", usernamesController);

export default usernamesRoute;
