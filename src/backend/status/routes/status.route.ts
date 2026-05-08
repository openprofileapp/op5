import { Router } from 'express';
import { statusController } from '../controllers/status.controller.js';

const router = Router();

router.get('/', statusController);

export default router;