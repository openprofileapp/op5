export default class PresenceTracker {
    private wsClient: WebSocket;
    private lastSentTime = 0;
    private started = false;

    private readonly throttle = 5000; // 5 seconds

    private readonly events = [
        "pointermove",
        "keydown",
        "click",
        "scroll",
        "touchstart"
    ];

    constructor(wsClient: WebSocket) {
        this.wsClient = wsClient;
    }

    private handleUserActivity = (): void => {
        if (document.hidden) return;

        const now = Date.now();

        if (now - this.lastSentTime >= this.throttle) {
            this.sendPresenceUpdate(true);
        }
    };

    private handleVisibilityChange = (): void => {
        if (document.hidden) {
            this.sendPresenceUpdate(false);
        } else {
            this.sendPresenceUpdate(true);
        }
    };

    private handleOpen = (): void => {
        if (!this.started) return;

        this.lastSentTime = 0;

        if (!document.hidden) {
            this.sendPresenceUpdate(true);
        }
    };

    public start(): void {
        if (this.started) return;

        this.started = true;

        this.events.forEach((event) => {
            window.addEventListener(event, this.handleUserActivity, {
                passive: true
            });
        });

        document.addEventListener(
            "visibilitychange",
            this.handleVisibilityChange
        );

        this.wsClient.addEventListener("open", this.handleOpen);

        if (!document.hidden) {
            this.sendPresenceUpdate(true);
        }
    }

    private sendPresenceUpdate(isActive: boolean): void {
        if (this.wsClient.readyState !== WebSocket.OPEN) {
            return;
        }

        this.lastSentTime = Date.now();

        this.wsClient.send(
            JSON.stringify({
                active: isActive
            })
        );
    }

    public stop(): void {
        if (!this.started) return;

        this.started = false;

        this.events.forEach((event) => {
            window.removeEventListener(event, this.handleUserActivity);
        });

        document.removeEventListener(
            "visibilitychange",
            this.handleVisibilityChange
        );

        this.wsClient.removeEventListener("open", this.handleOpen);
    }
}
