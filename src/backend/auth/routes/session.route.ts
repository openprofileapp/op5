import { Router } from "express";
import { authenticateSession } from "../controllers/session.controller.js";

const sessionRoute = Router();

sessionRoute.get("/", authenticateSession);

export default sessionRoute;

// MAYBE DELETE THIS AND ONLY RUN ON INTERNAL CALLS USING WEBSOCKET???