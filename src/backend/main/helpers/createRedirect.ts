import type { Request, Response } from "express";

export default function createRedirect(
    redirect: string,
    replace?: string
) {
    return (req: Request, res: Response) => {
        const pathname = req.originalUrl.replace(replace || "", "") || "/";
        return res.redirect(302, `${redirect}${pathname}`);
    };
}
