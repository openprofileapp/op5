import { Router } from "express";
import { authenticateSession } from "../controllers/session.controller.js";

const sessionRoute = Router();

sessionRoute.get("/", authenticateSession);

export default sessionRoute;
