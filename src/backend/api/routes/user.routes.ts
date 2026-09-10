import { Router } from "express";

import { getUsers } from "../controllers/users/getUsers.controller.js";
import { getTrendingUsers } from "../controllers/users/getTrendingUsers.controller.js";
import { getPopularUsers } from "../controllers/users/getPopularUsers.controller.js";
import { getRecentUsers } from "../controllers/users/getRecentUsers.controller.js";
import { getTaggedUsers } from "../controllers/users/getTaggedUsers.controller.js";
import { getRecommendedUsers } from "../controllers/users/getRecommendedUsers.controller.js";
import { getRecommendedTaggedUsers } from "../controllers/users/getRecommendedTaggedUsers.controller.js";
import { updateUsers } from "../controllers/users/updateUsers.controller.js";
import { updateUserPresence } from "../controllers/users/updateUserPresence.controller.js";

const userRoutes = Router();

userRoutes.get("/", getUsers);
userRoutes.get("/trending", getTrendingUsers);
userRoutes.get("/popular", getPopularUsers);
userRoutes.get("/recent", getRecentUsers);
userRoutes.get("/tag/:tag", getTaggedUsers);
userRoutes.get("/recommended", getRecommendedUsers);
userRoutes.get("/recommended/:tag", getRecommendedTaggedUsers);

userRoutes.post("/update/:userId", updateUsers);
userRoutes.get("/presence/:type/:userId", updateUserPresence);

export default userRoutes;
