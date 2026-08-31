import { banner } from "../../_common/scripts/banner.js";
import { log } from "./main.js";

export default class WsClient<TSend = unknown> {
    private ws: WebSocket;
    private queue: string[] = [];

    private cooldownMap = new Map<string, number>();
    private cooldownMs = 5000;
    private seen503Bypass = false;

    constructor(url: string) {
        if (!url) {
            throw new Error("Url is not defined");
        }
        
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            log.ws.info("Client connected to server");

            this.queue.forEach((msg) => this.ws.send(msg));
            this.queue = [];
        };

        this.ws.onmessage = (event: MessageEvent<string>) => {
            const rawData = event.data;
            const now = Date.now();
            const lastSeen = this.cooldownMap.get(rawData);

            if (lastSeen && now - lastSeen < this.cooldownMs) {
                return;
            }

            this.cooldownMap.set(rawData, now);

            setTimeout(() => {
                this.cooldownMap.delete(rawData);
            }, this.cooldownMs);
            
            try {
                const data = JSON.parse(event.data);

                if (
                    data.action === "DISPLAY_503" && 
                    window.location.pathname !== "/503"
                ) {
                    window.location.replace("/503");
                }

                if (
                    data.action === "DISPLAY_503_BYPASS" &&
                    !this.seen503Bypass
                ) {
                    this.seen503Bypass = true;

                    banner.show(
                        "Your permissions bypass the maximum connected user limit. OpenProfile may run slower than normal.",
                        {
                            type: "warning"
                        }
                    );
                }

                log.ws.info("Received from server:", data);
            } catch (error) {
                log.ws.error("Invalid JSON received:", event.data, error);
            }
        };

        this.ws.onerror = (event: Event) => {
            log.ws.error("WebSocket error:", event);
        };

        this.ws.onclose = () => {
            log.ws.warn("WebSocket connection closed");
        };
    }

    send(payload: TSend): void {
        const msg = JSON.stringify(payload);

        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
        } else {
            this.queue.push(msg);
        }
    }

    close(code?: number, reason?: string): void {
        this.ws.close(code, reason);
    }
}
