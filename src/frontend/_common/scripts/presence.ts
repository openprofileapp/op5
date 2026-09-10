export default class PresenceTracker {
    private wsClient: WebSocket;
    private handleUserActivity: () => void;
    private handleVisibilityChange: () => void;
    private lastSentTime: number = 0;

    private readonly throttle = 10000; // 10 seconds

    private events = ["pointermove", "keydown", "click", "scroll", "touchstart"];

    constructor(wsClient: WebSocket) {
        this.wsClient = wsClient;

        this.handleUserActivity = () => {
            const now = Date.now();
            if (now - this.lastSentTime >= this.throttle) {
                this.lastSentTime = now;
                this.sendPresenceUpdate(true);
            }
        };

        this.handleVisibilityChange = () => {
            this.sendPresenceUpdate(!document.hidden);
        };
    }

    public start() {
        this.events.forEach((event) => {
            window.addEventListener(event, this.handleUserActivity, { passive: true });
        });

        document.addEventListener("visibilitychange", this.handleVisibilityChange);

        this.sendPresenceUpdate(true);
    }

    private sendPresenceUpdate(isActive: boolean) {
        if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
            this.lastSentTime = Date.now();
            this.wsClient.send(
                JSON.stringify({
                    active: isActive
                })
            );
        }
    }

    public stop() {
        this.events.forEach((event) => {
            window.removeEventListener(event, this.handleUserActivity);
        });

        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
}
