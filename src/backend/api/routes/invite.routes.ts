import { Router } from "express";

import { getInvitesController } from "../controllers/invites.controller.js";

const inviteRoutes = Router();

inviteRoutes.get("/code/:code", getInvitesController);
inviteRoutes.get("/owner/:ownerId", getInvitesController);
inviteRoutes.get("/user/:userId", getInvitesController);

export default inviteRoutes;
