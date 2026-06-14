import { Router } from "express";
import { 
    getInvitesController, 
    getInviteByCodeController, 
    getInvitesByOwnerController
} from "../controllers/invite.controller.js";

const inviteRoutes = Router();

inviteRoutes.get("/", getInvitesController);
inviteRoutes.get("/code/:inviteCode", getInviteByCodeController);
inviteRoutes.get("/owner/:ownerId", getInvitesByOwnerController);

export default inviteRoutes;