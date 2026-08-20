import { Router } from "express";
import { getRandomLike } from "../controllers/getRandomLike.controller.js";

const randomRoutes = Router();

randomRoutes.get("/like", getRandomLike);

export default randomRoutes;
