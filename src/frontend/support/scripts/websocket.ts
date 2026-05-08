import { log } from "./main.js";

export default class WsClient<TSend = unknown> {
    private ws: WebSocket;
    private queue: string[] = [];

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
            try {
                const data = JSON.parse(event.data);

                if (data.message === "connected") {
                    // Call an action
                }

                log.ws.info("Received from server:", data);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                log.ws.error("Invalid JSON received:", event.data);
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