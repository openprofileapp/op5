import { Router } from "express";

import { getPrivateInvitesController } from "../controllers/privateInvites.controller.js";

const inviteRoutes = Router();

inviteRoutes.get("/code/:code", getPrivateInvitesController);
inviteRoutes.get("/owner/:ownerId", getPrivateInvitesController);

export default inviteRoutes;
