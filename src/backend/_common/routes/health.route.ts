import { Router, Request, Response } from 'express';

const healthRoute = Router();

healthRoute.get("/", (req: Request, res: Response) => {
    res.status(200).send("");
});

export default healthRoute;