/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Logger } from "kage-library/client";

import WsClient from "./websocket.js";
import PresenceTracker from "../../_common/scripts/presence.js";

export const log = new Logger({
    useNerdFonts: window.config.useNerdFonts
});

window.ws = new WsClient(`wss://${window.config.domains.main}`);

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
