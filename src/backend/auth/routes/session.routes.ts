import { Router } from "express";
import type { Request, Response } from "express";

import { validateSessionMiddleware } from "../middlewares/validateSession.middleware.js";
import validateSession from "../services/validateSession.service.js";
import { AdvancedError } from "kage-library";
import { log } from "../instances.js";

const sessionRoute = Router();

sessionRoute.get("/", validateSessionMiddleware, async (req: Request, res: Response) => {
    return res.status(200).json(
        {...req.session}
    );
});

sessionRoute.post("/", async (req: Request, res: Response) => {
    try {
        const response = await validateSession(
            {
                ...req.body,
                get(name: string) {
                    return this.headers?.[name.toLowerCase()];
                }
            },
            res
        );

        return res.json({ ...response });
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.network.error(error.stack).save();
            return res.status(error.code).json(error.message);
        } else {
            console.log(error);
        }
    }
});

export default sessionRoute;
