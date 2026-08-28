export default async function setupWebPushNotifications() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        if (Notification.permission === "default") {
            Notification.requestPermission().catch(() => {});
        }

        const pollInterval = 500;

        while (Notification.permission !== "granted") {
            if (Notification.permission === "denied") return;
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: window.config.integrations.webPush,
            });
        }

        await fetch(`https://${window.config.domains.api}/v3/webpush`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(subscription),
        });
    } catch (error) {
        console.error("Web push notifications failed to register:", error);
    }
}
