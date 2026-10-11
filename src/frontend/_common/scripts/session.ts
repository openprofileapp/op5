import { banner } from "./banner.js";
import { cookie } from "./cookies.js";
import { authBaseUrl } from "./domains.js";

export const verifySession = async (): Promise<void> => {
    try {
        const inviteCode = new URLSearchParams(window.location.search).get("invite");

        const response = await fetch(
            `${authBaseUrl}/session${inviteCode ? `?invite=${encodeURIComponent(inviteCode)}` : ""}`,
            { credentials: "include" }
        );

        window.session = await response.json();

        const is503Page = window.location.pathname === "/503";
        const is503Action = window.session?.action === "DISPLAY_503";
        const is503BypassAction = window.session?.action === "DISPLAY_503_BYPASS";

        if (
            is503BypassAction &&
            cookie.get("hasSeen503BypassBanner")?.split("T")[0] !==
                new Date().toISOString().split("T")[0]
        ) {
            banner.show(
                "Your permissions bypass the maximum connected user limit. OpenProfile may run slower than normal.",
                {
                    type: "warning",
                    closeAction: { 
                        onClick: () => {
                            cookie.set(
                                "hasSeen503BypassBanner", 
                                new Date().toISOString()
                            );
                        } 
                    }
                }
            );
        }

        if (is503Action && !is503Page) {
            window.location.href = "/503";
        } else if (!is503Action && is503Page) {
            window.location.href = "/";
        }
    } catch (error) {
        console.error("Failed to verify session:", error);
    }
};
