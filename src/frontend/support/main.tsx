import React from "react"
import ReactDOM from "react-dom/client"
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { I18nextProvider } from "react-i18next"

import i18n from "../_common/i18n.js"
import { apiBaseUrl, cdnBaseUrl } from "../_common/scripts/domains.js"
import { ModalProvider } from "../_common/hooks/ModalContext.hook.js"
import { verifySession } from "../_common/scripts/session.js"
import { banner } from "../_common/scripts/banner.js"

import "../_common/styles/tailwind.css"
import "../_common/styles/app.css"
import "./scripts/main.js"

import ToastContainer from "../_common/components/ToastContainer.js"
import CaptchaPortal from "../_common/components/modals/CaptchaPortal.js"
import Messages from "../_common/components/Messages.js"

import NotFound from "../_common/pages/NotFound.js"
import Maintenance from "../_common/pages/Maintenance.js"

import Article from "./pages/Article.js"

const style = document.createElement("style")

style.textContent = `
    @font-face {
        font-family: "Alexandria";
        src: url("${cdnBaseUrl}/fonts/alexandria/AlexandriaVariableFont.ttf") format("truetype");
    }

    @font-face {
        font-family: "NerdFont";
        src: url("${cdnBaseUrl}/fonts/jetbrainsmono/JetBrainsMonoNerdFontPropo-Regular.ttf") format("truetype");
    }
`

document.head.appendChild(style)

async function bootstrap() {
    if (!window.config.isMaintenance) {
        await verifySession();

        if (!localStorage.getItem("locale")) {
            localStorage.setItem(
                "locale", 
                window.session.locale || window.config.metadata.locale
            );
        }

        if (localStorage.getItem("locale")) {
            await i18n.changeLanguage(localStorage.getItem("locale") as string);

            if (
                (
                    localStorage.getItem("locale")?.startsWith("zh") ||
                    localStorage.getItem("locale")?.startsWith("es") ||
                    localStorage.getItem("locale")?.startsWith("hi") ||
                    localStorage.getItem("locale")?.startsWith("ar") ||
                    localStorage.getItem("locale")?.startsWith("ru") ||
                    localStorage.getItem("locale")?.startsWith("id") ||
                    localStorage.getItem("locale")?.startsWith("ja")
                ) &&
                !localStorage.getItem("hasSeenLocaleBanner")
            ) {
                banner.show(
                    i18n.t("banners.locale"),
                    {
                        type: "warning",
                        closeAction: { 
                            onClick: () => {
                                localStorage.setItem("hasSeenLocaleBanner", "true");
                            } 
                        }
                    }
                );
            }
        }

        if (!localStorage.getItem("hasSeenBetaBanner")) {
            banner.show(
                i18n.t("banners.beta"),
                {
                    type: "error",
                    button: { 
                        label: "Join our Discord", 
                        onClick: () => {
                            window.open(window.config.metadata.urls.discord.main, "_blank");
                        } 
                    },
                    closeAction: { 
                        onClick: () => {
                            localStorage.setItem("hasSeenBetaBanner", "true");
                        } 
                    }
                }
            );
        }

        if (window.session?.userId) {
            const response = await fetch(
                `${apiBaseUrl}/v3/users?id=${window.session?.userId}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json()

            window.session.user = data.items[0];
        }
    }

    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <HelmetProvider>
                <I18nextProvider i18n={i18n}>
                    <BrowserRouter>
                        {window.config.isMaintenance ? (
                            <Maintenance />
                        ) : (
                            <ModalProvider>
                                <ToastContainer />
                                <CaptchaPortal
                                    siteKey={window.config.integrations.hcaptcha}
                                />
                                <Messages />

                                <Routes>
                                    <Route
                                        path="/en-us/article/*"
                                        element={<Article />}
                                    />

                                    <Route path="/404" element={<NotFound />} />
                                    <Route
                                        path="*"
                                        element={<Navigate to="/404" replace />}
                                    />
                                </Routes>
                            </ModalProvider>
                        )}
                    </BrowserRouter>
                </I18nextProvider>
            </HelmetProvider>
        </React.StrictMode>
    );
}

bootstrap();
