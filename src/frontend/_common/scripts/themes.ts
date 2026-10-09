import i18n from "../i18n.js";
import { banner } from "./banner.js";
import { cookie } from "./cookies.js";
import { cdnBaseUrl } from "./domains.js";
import { toast } from "./toast.js";

let themeBannerId: number | null = null;

export const fonts = `
    @font-face {
        font-family: "Alexandria";
        src: url("${cdnBaseUrl}/fonts/alexandria/AlexandriaVariableFont.ttf") format("truetype");
    }

    @font-face {
        font-family: "NerdFont";
        src: url("${cdnBaseUrl}/fonts/jetbrainsmono/JetBrainsMonoNerdFontPropo-Regular.ttf") format("truetype");
    }

    @font-face {
        font-family: "NewRocker";
        src: url("${cdnBaseUrl}/fonts/new-rocker/NewRockerRegular.ttf") format("truetype");
    }

    @font-face {
        font-family: "VarelaRound";
        src: url("${cdnBaseUrl}/fonts/varela-round/VarelaRound-Regular.ttf") format("truetype");
    }

    @font-face {
        font-family: "CherryBombOne";
        src: url("${cdnBaseUrl}/fonts/cherry-bomb-one/CherryBombOne-Regular.ttf") format("truetype");
    }
`;

export const themes = [
    { 
        id: "light", 
        name: "Light", 
        preview: {
            background: "#f8f8f8",
            border: "#eeeeee",
            text: "#1a1a1a",
            accent: {
                background: "#ce1616",
                text: "#ffffff"
            }
        }
    },
    { 
        id: "dark", 
        name: "Dark", 
        preview: {
            background: "#111111",
            border: "#222222",
            text: "#eaeaea",
            accent: {
                background: "#ce1616",
                text: "#ffffff"
            }
        }
    },
    { 
        id: "corundum", 
        name: "Corundum", 
        preview: {
            background: "#3b0707",
            border: "#5f1717",
            text: "#eaeaea",
            accent: {
                background: "#ce1616",
                text: "#ffffff"
            }
        }
    },
    { 
        id: "noon", 
        name: "Noon", 
        preview: {
            background: "#f5f7fc",
            border: "#e5eaf5",
            text: "#1a1a1a",
            accent: {
                background: "#2a4ede",
                text: "#ffffff"
            }
        }
    },
    { 
        id: "midnight", 
        name: "Midnight", 
        preview: {
            background: "#11141b",
            border: "#222733",
            text: "#eaeaf0",
            accent: {
                background: "#2a4ede",
                text: "#ffffff"
            }
        }
    },
    { 
        id: "coffee", 
        name: "Coffee",
        font: "VarelaRound",
        preview: {
            background: "#211813",
            border: "#35261d",
            text: "#eee1d0",
            accent: {
                background: "#ffd700",
                text: "#24170e"
            }
        },
        premiumOnly: true,
    },
    { 
        id: "kawaii", 
        name: "Kawaii",
        font: "CherryBombOne",
        preview: {
            background: "#ffe0f2",
            border: "#f5c8e8",
            text: "#542b50",
            accent: {
                background: "#ffb7c5",
                text: "#71364f"
            }
        },
        premiumOnly: true,
    },
    { 
        id: "spooky", 
        name: "Spooky", 
        font: "NewRocker",
        preview: {
            background: "#100813",
            border: "#1d1022",
            text: "#d8cedd",
            accent: {
                background: "#793a96",
                text: "#fff0ff"
            }
        },
        premiumOnly: true,
        freeMonth: "October"
    }
] as const;

export type ThemesType = (typeof themes)[number];
export type ThemesIdType = ThemesType["id"];
export type ThemesNameType = ThemesType["name"];

export function applyTheme(id: string) {
    const theme = themes.find(theme => theme.id === id);
    const root = document.documentElement;

    if (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        theme?.premiumOnly && 
        !window.session.permissions.array.includes("PREMIUM_ACCESS")
    ) {
        toast.show(
            "You premium to use this theme",
            { type: "error" }
        );

        return;
    }

    cookie.set("theme", theme?.id as string);

    root.setAttribute("data-theme", theme?.id ?? "dark");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (theme?.font) {
        root.style.setProperty(
            "--theme-font",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            `"${theme.font}", sans-serif`
        );
    } else {
        root.style.removeProperty("--theme-font");
    }

    if (
        !cookie.get("hasSeenThemeBanner") &&
        cookie.get("theme") !== "dark"
    ) {
        themeBannerId = banner.show(
            i18n.t("banners.theme"),
            {
                type: "warning",
                closeAction: { 
                    onClick: () => {
                        cookie.set("hasSeenThemeBanner", "true");
                    } 
                }
            }
        );
    } else {
        banner.hide(themeBannerId as number);
        themeBannerId = null;
    }
}
