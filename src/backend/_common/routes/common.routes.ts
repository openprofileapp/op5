import express, { Router } from "express";
import path from "path";

import { config } from "../../../../app.config.js";

const commonRoutes = Router();

commonRoutes.use("/manifest.json", express.static(path.join(config.folders.public, "/manifest.json")));
commonRoutes.use("/robots.txt", express.static(path.join(config.folders.public, "/robots.txt")));
commonRoutes.use("/ads.txt", express.static(path.join(config.folders.public, "/ads.txt")));
commonRoutes.use("/sw.js", express.static(path.join(config.folders.public, "/sw.js")));
commonRoutes.use("/terms-of-service.md", express.static(path.join(config.folders.public, "/terms-of-service.md")));
commonRoutes.use("/privacy-policy.md", express.static(path.join(config.folders.public, "/privacy-policy.md")));
commonRoutes.use("/branding-guidelines.md", express.static(path.join(config.folders.public, "/branding-guidelines.md")));
commonRoutes.use("/license.md", express.static(path.join(config.folders.public, "/license.md")));
commonRoutes.use("/credits.md", express.static(path.join(config.folders.public, "/credits.md")));

export default commonRoutes;
