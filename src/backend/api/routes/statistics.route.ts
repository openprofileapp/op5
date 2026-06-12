import { Router } from "express";
import { getStatistics } from "../controllers/statistics.controller.js";

const statisticsRoute = Router();

statisticsRoute.get("/:id", getStatistics);

export default statisticsRoute;