import express, { Router } from 'express';
import path from 'path';

import { config } from '../../../../app.config.js';

const commonRoutes = Router();

commonRoutes.use("/manifest.json", express.static(path.join(config.folders.public, "/manifest.json")));
commonRoutes.use("/robots.txt", express.static(path.join(config.folders.public, "/robots.txt")));
commonRoutes.use("/ads.txt", express.static(path.join(config.folders.public, "/ads.txt")));

export default commonRoutes;