import WsClient from "./websocket.js";

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

// Create new websocket client
window.ws = new WsClient(`wss://${window.config.domains.websocket}`);

// Tell the server client is loaded and ready
window.ws.send({ status: "ready" });
