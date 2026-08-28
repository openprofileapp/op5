import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { cropToCircle } from "../../helpers/cropToCircle.js";
import sharp from "sharp";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";

export const cropDuoController = async (req: Request, res: Response) => {
    const sourceUrl = req.query.sourceUrl as string;
    const targetUrl = req.query.targetUrl as string;
    const rawSize = req.query.size;

    try {
        assertNotNull([sourceUrl, targetUrl]);

        const size = !isNaN(Number(rawSize))
            ? Math.min(Math.max(Number(rawSize), 16), 1024)
            : 256;

        const [sourceResponse, targetResponse] = await Promise.all([
            fetch(sourceUrl),
            fetch(targetUrl)
        ]);

        // DEVELOPER NEEDED: add assertOkResponse();
        if (!sourceResponse.ok || !targetResponse.ok) {
            throw new AdvancedError({
                code: 400,
                message: "Failed to fetch an image"
            });
        }

        const [sourceBuffer, targetBuffer] = await Promise.all([
            sourceResponse.arrayBuffer().then(Buffer.from),
            targetResponse.arrayBuffer().then(Buffer.from)
        ]);

        const singleSize = Math.floor(size * 0.7);

        const [sourceCircle, targetCircle] = await Promise.all([
            await cropToCircle(sourceBuffer, singleSize),
            await cropToCircle(targetBuffer, singleSize)
        ]);

        const bottomRightPos = size - singleSize;

        const imageBuffer = await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
        .composite([
            { input: targetCircle, left: bottomRightPos, top: bottomRightPos },
            { input: sourceCircle, left: 0, top: 0 }
        ])
        .png({ compressionLevel: 6 })
        .toBuffer();

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
