import { Router } from 'express';

import { getArticlesController } from '../controllers/articles/getArticles.controller.js';
import { getArticleController } from '../controllers/articles/getArticle.controller.js';
import { getImportantChangesController } from '../controllers/articles/getImportantChanges.controller.js';

const articleRoutes = Router();

articleRoutes.get("/", getArticlesController);
articleRoutes.get("/*slug", getArticleController);
articleRoutes.get("/latest", getImportantChangesController);

export default articleRoutes;
