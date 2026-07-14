import { Router } from "express";
import type { Request, Response } from 'express';

import { getUsers } from "../controllers/user.controller.js";

const userRoute = Router();

userRoute.get("/", getUsers); // DEV NOTE: Add a limit/search

userRoute.get("/:userId", async (req: Request, res: Response) => {
    return res.status(400).json({ error: "Invalid parameter"});
});

userRoute.get("/:userId/pins", (req: Request, res: Response) => {
    // REQUIRE ACCESS TOKEN
    const { userId } = req.params;

    return res.status(400).json({ ...req.session});
});

// userRoute.post("/:userId/pins", CODE HERE, NO EXT CALL);

export default userRoute;