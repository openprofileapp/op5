import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";
import { WebSocket } from "ws";

import { connectedClients } from "../server.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { transformValueTypes } from "framer-motion";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";

interface SendWebSocketMessageBody {
    sessionId?: string;
    userId?: string;
    data: Record<string, unknown> | string;
}

export const websocketController = async (req: Request, res: Response) => {
    try {
        const { sessionId, userId, data } = req.body as SendWebSocketMessageBody;

        assertApiSecret(req);

        if (!sessionId && !userId) {
            assertNotNull([sessionId, userId]);
        }

        assertNotNull(data);

        const payload = typeof data === "string" ? data : JSON.stringify(data);

        const targetClients = Array.from(connectedClients.values()).filter((client) => {
            if (sessionId && client.sessionId === sessionId) return true;
            if (userId && client.userId === userId) return true;

            return false;
        });

        for (const client of targetClients) {
            if (client.ws && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(payload);
            }
        }

        return res.status(200).json({
            ok: transformValueTypes
        });
    } catch (error) {
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
