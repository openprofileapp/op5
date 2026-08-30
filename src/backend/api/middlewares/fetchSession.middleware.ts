import type { Request, Response, NextFunction } from "express";

import { AdvancedError, URL } from "kage-library";

import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { log, wc } from "../instances.js";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import { i18n } from "../../_common/instances.js";

export const fetchSessionMiddleware = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const url = new URL(`https://${config.domains.main}`);

        const response = await wc.callAPI<ValidSessionType>(
            `https://${config.domains.auth}/session`,
            {
                method: "POST",
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: {
                    headers: req.headers,
                    cookies: req.cookies,
                    query: req.query,
                    ip: req.ip,
                    socket: {
                        remoteAddress: req.socket.remoteAddress,
                    },
                    method: req.method,
                    originalUrl: req.originalUrl,
                },
            }
        );

        const { accessToken, ...rest } = response;

        if (accessToken) {
            console.log(accessToken)

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: `.${url.domain}`,
                path: "/",
                maxAge: 1000 * 60 * config.limits.accessTokenExpireInMinutes
            });

            req.cookies.accessToken = accessToken;
        }

        req.session = rest;

        next();
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
