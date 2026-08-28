import { Router } from "express";
import { getStatisticsController } from "../controllers/statistics.controller.js";

const statisticsRoute = Router();

statisticsRoute.get("/:id", getStatisticsController);

export default statisticsRoute;
