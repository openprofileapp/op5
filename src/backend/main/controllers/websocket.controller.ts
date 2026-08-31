import type { Request, Response } from "express"

import { AdvancedError } from "kage-library";

import { connectedClients } from "../server.js"
import { log } from "../instances.js"
import { i18n } from "../../_common/instances.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";

export const websocketController = async (req: Request, res: Response) => {
    try {
        const { sessionId, action } = req.body;

        assertNotNull([sessionId, action]);

        const client = connectedClients.get(sessionId);

        if (client && client.readyState === WebSocket.OPEN) {
            const payload = typeof action === "string" 
                ? JSON.stringify({ action }) 
                : JSON.stringify(action);

            client.send(payload);
        }

        return res.status(200).json({ ok: true });
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
}
