import { Router } from "express";
import { contentReportController } from "../controllers/contentReport.controller.js";
import { bugReportController } from "../controllers/bugReport.controller.js";

const reportRoutes = Router();

reportRoutes.post("/content", contentReportController);
reportRoutes.post("/bug", bugReportController);

export default reportRoutes;
