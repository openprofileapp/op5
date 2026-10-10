/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Snowflake } from "kage-library/client";

import WsClient from "../../_common/scripts/websocket.js";
import PresenceTracker from "../../_common/scripts/presence.js";

export const snowflake = new Snowflake(
    "2026-01-01T00:00:00.000Z",
    5
);

window.ws = new WsClient(`wss://${window.config.domains.websocket}`);

// @ts-ignore
const tracker = new PresenceTracker(window.ws.ws);

// @ts-ignore
if (window.ws.ws.readyState === WebSocket.OPEN) {
    tracker.start();
    // @ts-ignore
    window.ws.send({ status: "ready" });
} else {
    // @ts-ignore
    window.ws.ws.addEventListener("open", () => {
        tracker.start();
        // @ts-ignore
        window.ws.send({ status: "ready" });
    });
}
