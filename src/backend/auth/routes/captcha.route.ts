import { Router } from 'express';
import { captchaController } from '../controllers/captcha.controller.js';

const captchaRoute = Router();

captchaRoute.post('/verify', captchaController);

export default captchaRoute;
