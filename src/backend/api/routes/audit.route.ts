import { Router } from "express";
import { createAuditLogController } from "../controllers/audit.controller.js";

const auditRoute = Router();

auditRoute.post("/create", createAuditLogController);

export default auditRoute;