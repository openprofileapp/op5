import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import { wc } from "../../_common/instances.js";
import getEnv from "../../../_common/helpers/getEnv.js";

type Hcaptcha = {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    credit: boolean;
}

export const verifyCaptcha = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            throw new AdvancedError({ code: 400, message: "Invalid token" });
        }

        const result: Hcaptcha = await wc.callAPI(
            "https://hcaptcha.com/siteverify",
            {
                method: "POST",
                format: "json",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    secret: getEnv("INTEGRATION_HCAPTCHA_SECRET"),
                    response: token,
                }),
            }
        );

        if (result.success) {
            return res.status(200).json({ ok: result.success });
        } else {
            return res.status(400).json({ ok: result.success });
        }

    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error.stack).save();
            return res.status(error.code).json(error.message);
        } else {
            console.log("Unknown error (captcha.controller.ts):", error);
        }
    }
};