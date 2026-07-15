import { Router } from "express";
import type { Request, Response } from "express";

import { getUsers } from "../controllers/getUsers.controller.js";

const userRoute = Router();

userRoute.get("/", getUsers); // DEV NOTE: Add a limit/search

userRoute.get("/:userId", async (req: Request, res: Response) => {
    return res.status(400).json({ error: "Invalid parameter"});
});

export default userRoute;