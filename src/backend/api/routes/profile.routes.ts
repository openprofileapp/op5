import { Router } from 'express';
import { getProfiles } from '../controllers/profile.controller.js';

const profileRoutes = Router();

profileRoutes.get('/', getProfiles);

export default profileRoutes;