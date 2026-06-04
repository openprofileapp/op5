import { Router } from 'express';
import { getInvites } from '../controllers/invite.controller.js';

const inviteRoute = Router();

inviteRoute.get('/', getInvites);

export default inviteRoute;