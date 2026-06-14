import { Router } from "express";
import { getProfiles } from "../controllers/profile.controller.js";

const profileRoute = Router();

profileRoute.get("/", getProfiles);

export default profileRoute;