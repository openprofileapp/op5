import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { discordRoles, log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";

type Props = {
    discordUserId: string;
    action: "add" | "remove";
    roleId: string;
}

export const updateRoleController = async (req: Request, res: Response) => {
    try {
        const { discordUserId, action, roleId } = req.params as unknown as Props;

        assertApiSecret(req);

        if (action === "add") {
            await discordRoles.add(
                discordUserId, 
                roleId
            );
        } else {
            await discordRoles.remove(
                discordUserId, 
                roleId
            );
        }

        res.status(200).json({
            ok: true
        });
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
