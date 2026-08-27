self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// DEVELOPER NEEDED: Make this respond to app config whether through build command or window.config
self.addEventListener("push", (event) => {
    let payload = {
        title: "OpenProfile",
        body: "You have a new notification",
        icon: "https://cdn.openprofile.app/branding/icon.svg",
        url: "https://openprofile.app/account/notifications",
    };

    if (event.data) {
        try {
            payload = { ...payload, ...event.data.json() };
        } catch (error) {
            payload.body = event.data.text();
            console.error("Failed to parse push JSON payload:", error);
        }
    }

    const options = {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge || payload.icon,
        data: {
            url: payload.url,
        },
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const fallbackUrl = "https://openprofile.app/account/notifications";
    const targetUrl = event.notification.data?.url || fallbackUrl;

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
