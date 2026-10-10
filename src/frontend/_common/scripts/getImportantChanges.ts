import { banner } from "./banner.js";
import { cookie } from "./cookies.js";
import { mainBaseUrl, supportBaseUrl } from "./domains.js";
import fetchMarkdownFile from "./fetchMarkdownFile.js";
import { formatLongRelative } from "./time.js";

export const getImportantChanges = async (): Promise<void> => {
    try {
        const response = await fetch(
            `${supportBaseUrl}/articles/latest`,
            { credentials: "include" }
        );

        const versionData = await response.json();
        const termsData = await fetchMarkdownFile("terms-of-service");
        const privacyData = await fetchMarkdownFile("privacy-policy");

        if (!cookie.get("hasSeenUpdateBanner")) {
            cookie.set(
                "hasSeenUpdateBanner", 
                versionData.title
            );
        }

        if (cookie.get("hasSeenUpdateBanner") !== versionData.title) {
            banner.show(
                `OpenProfile has been updated to ${versionData.title}!`,
                {
                    type: "error",
                    button: { 
                        label: "What's New?", 
                        onClick: () => {
                            window.open(`${supportBaseUrl}/en-us/article/${versionData.slug}`, "_blank");
                        } 
                    },
                    closeAction: { 
                        onClick: () => {
                            cookie.set(
                                "hasSeenUpdateBanner", 
                                versionData.title
                            );
                        } 
                    }
                }
            );
        }

        if (!cookie.get("hasSeenPrivacyBanner")) {
            cookie.set(
                "hasSeenPrivacyBanner", 
                privacyData?.updated as string
            );
        }

        if (cookie.get("hasSeenPrivacyBanner") !== privacyData?.updated as string) {
            banner.show(
                `Our Privacy Policy was updated ${formatLongRelative(privacyData?.updated)}.`,
                {
                    type: "error",
                    button: { 
                        label: "Review Changes", 
                        onClick: () => {
                            window.open(`${mainBaseUrl}/privacy`, "_blank");
                        } 
                    },
                    closeAction: { 
                        onClick: () => {
                            cookie.set(
                                "hasSeenPrivacyBanner", 
                                privacyData?.updated as string
                            );
                        } 
                    }
                }
            );
        }

        if (!cookie.get("hasSeenTermsBanner")) {
            cookie.set(
                "hasSeenTermsBanner", 
                termsData?.updated as string
            );
        }

        if (cookie.get("hasSeenTermsBanner") !== termsData?.updated as string) {
            banner.show(
                `Our Terms of Service were updated ${formatLongRelative(termsData?.updated)}.`,
                {
                    type: "error",
                    button: { 
                        label: "Review Changes", 
                        onClick: () => {
                            window.open(`${mainBaseUrl}/terms`, "_blank");
                        } 
                    },
                    closeAction: { 
                        onClick: () => {
                            cookie.set(
                                "hasSeenTermsBanner", 
                                termsData?.updated as string
                            );
                        } 
                    }
                }
            );
        }
    } catch (error) {
        console.error("Failed to fetch important changes:", error);
    }
};
