import { Logger } from "kage-library/client";
import WsClient from "./websocket.js";

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

export const log = new Logger({
    useNerdFonts: window.config.useNerdFonts
});

// Create new websocket client
window.ws = new WsClient(`wss://${window.config.domains.support}`);

// Tell the server client is loaded and ready
window.ws.send({ status: "ready" });