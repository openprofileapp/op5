import { Router } from "express";

import { getInvitesController } from "../controllers/invites.controller.js";

const inviteRoutes = Router();

inviteRoutes.get("/code/:code", getInvitesController);
inviteRoutes.get("/owner/:ownerId", getInvitesController);

export default inviteRoutes;
