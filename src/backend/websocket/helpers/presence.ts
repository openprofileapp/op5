import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { connectedClients, idleTimers, isUserIdle } from "../server.js";
import { wc } from "../../_common/instances.js";

function clearIdleTimer(sessionId: string): void {
    const timer = idleTimers.get(sessionId);

    if (timer) {
        clearTimeout(timer);
        idleTimers.delete(sessionId);
    }
}

async function updatePresence(
    userId: string,
    status: "online" | "idle"
): Promise<boolean> {
    const response: { ok: boolean } = await wc.callAPI(
        `https://${config.domains.api}/v3/presence/${status}/${userId}`,
        { auth: `ApiSecret ${getEnv("API_SECRET")}` }
    );

    return response.ok;
}

function sendPresenceToClient(
    sessionId: string,
    userId: string,
    status: "online" | "idle"
): void {
    const client = connectedClients.get(sessionId);

    if (client?.ws.readyState === 1) {
        client.ws.send(
            JSON.stringify({
                presence: {
                    id: userId,
                    presence: status
                }
            })
        );
    }
}

export async function markUserIdle(
    sessionId: string,
    userId: string
): Promise<void> {
    const client = connectedClients.get(sessionId);

    if (!client || client.userId !== userId) {
        return;
    }

    if (isUserIdle.get(userId)) {
        return;
    }

    const isUpdated = await updatePresence(userId, "idle");

    if (isUpdated) {
        isUserIdle.set(userId, true);
        sendPresenceToClient(sessionId, userId, "idle");
    }
}

export async function checkIdleTimer(
    sessionId: string,
    userId: string
): Promise<void> {
    clearIdleTimer(sessionId);

    if (isUserIdle.get(userId)) {
        const isUpdated = await updatePresence(userId, "online");

        if (isUpdated) {
            isUserIdle.set(userId, false);
            sendPresenceToClient(sessionId, userId, "online");
        }
    }

    const timer = setTimeout(() => {
        void markUserIdle(sessionId, userId);
    }, Math.max(0, config.limits?.setIdlePresenceInMinutes ?? 1) * 60_000);

    idleTimers.set(sessionId, timer);
}
