import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import { i18n, wc } from "../../_common/instances.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";
import { config } from "../../../../app.config.js";
import { WhatIsType } from "../../../_common/types/whatIs.type.js";
import getEnv from "../../../_common/helpers/getEnv.js";

export const redirectController = async (req: Request, res: Response) => {
    try {
        assertApiSecret(req);

        const characterId = req.path.replace(/^\/+/, "");

        const characterWhatIs = await wc.callAPI<WhatIsType>(
            `https://${config.domains.api}/v3/whatis/${characterId}`,
            { auth: `ApiSecret ${getEnv("API_SECRET")}` }
        );

        const ownerWhatIs = await wc.callAPI<WhatIsType>(
            `https://${config.domains.api}/v3/whatis/${characterWhatIs.ownerId}`,
            { auth: `ApiSecret ${getEnv("API_SECRET")}` }
        );
        
        return res.redirect(302,
            "https://" +
            config.domains.main +
            "/user/" +
            (ownerWhatIs.primaryUsername || ownerWhatIs.id) +
            `?view=${encodeURIComponent(characterId)}` +
            "#characters"
        );
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
