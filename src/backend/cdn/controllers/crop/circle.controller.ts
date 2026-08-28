import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { cropToCircle } from "../../helpers/cropToCircle.js";

export const cropCircleController = async (req: Request, res: Response) => {
    const url = req.query.url as string;
    const rawSize = req.query.size;

    try {
        assertNotNull(url);

        const size = !isNaN(Number(rawSize))
            ? Math.min(Math.max(Number(rawSize), 16), 1024)
            : 256;

        const response = await fetch(url);

        // DEVELOPER NEEDED: add assertOkResponse();
        if (!response.ok) {
            throw new AdvancedError({
                code: 400,
                message: "Failed to fetch image"
            })
        }

        const arrayBuffer = await response.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        const imageBuffer = await cropToCircle(inputBuffer, size)

        res.setHeader("Content-Type", "image/png");
        return res.status(200).send(imageBuffer);
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
