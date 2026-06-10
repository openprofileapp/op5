import { Router } from 'express';
import { verifyCaptcha } from '../controllers/captcha.controller.js';

const captchaRoute = Router();

captchaRoute.post('/verify', verifyCaptcha);

export default captchaRoute;