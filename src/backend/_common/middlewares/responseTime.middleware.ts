import type { Request, Response, NextFunction } from "express";
import { Stopwatch } from "@sapphire/stopwatch";

/**
 * Measures full request latency from start to finish
 */
export function responseTime(req: Request, res: Response, next: NextFunction) {
    const sw = new Stopwatch();

    res.on("finish", () => {
        const { duration } = sw.stop();

        const route = req.originalUrl || req.url;
        const method = req.method;

        if (duration < 100) {
            console.log(`[FAST] ${method} ${route} - ${duration.toFixed(2)}ms`);
        } else if (duration < 300) {
            console.log(`[OK] ${method} ${route} - ${duration.toFixed(2)}ms`);
        } else if (duration < 1000) {
            console.warn(`[SLOW] ${method} ${route} - ${duration.toFixed(2)}ms`);
        } else {
            console.error(`[VERY SLOW] ${method} ${route} - ${duration.toFixed(2)}ms`);
        }
    });

    next();
}