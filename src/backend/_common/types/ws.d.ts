import "ws";

declare module "ws" {
    interface WebSocket {
        sessionId: string;
        userId: string;
    }
}
