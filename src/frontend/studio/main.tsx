import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { I18nextProvider } from "react-i18next"

import i18n from "../_common/i18n.js"
import { ModalProvider } from "../_common/hooks/ModalContext.hook.js"

import { apiBaseUrl, cdnBaseUrl } from "../_common/scripts/domains.js"
import { banner } from "../_common/scripts/banner.js"
import { verifySession } from "../_common/scripts/session.js"

import "../_common/styles/tailwind.css";
import "../_common/styles/app.css"
import "./scripts/main.js";

const style = document.createElement("style");

style.textContent = `
    @font-face {
        font-family: "Alexandria";
        src: url("${cdnBaseUrl}/fonts/alexandria/AlexandriaVariableFont.ttf") format("truetype");
    }

    @font-face {
        font-family: "NerdFont";
        src: url("${cdnBaseUrl}/fonts/jetbrainsmono/JetBrainsMonoNerdFontPropo-Regular.ttf") format("truetype");
    }
`;

document.head.appendChild(style);

import Layout from "./Layout.js"

import ToastContainer from "../_common/components/ToastContainer.js"
import CaptchaPortal from "../_common/components/modals/CaptchaPortal.js"
import Messages from "../_common/components/Messages.js"

import Dashboard from "./pages/Dashboard.js"
import Analytics from "./pages/Analytics.js"
import Content from "./pages/Content.js"
import Templates from "./pages/Templates.js"
import Datasets from "./pages/Datasets.js"
import Trash from "./pages/Trash.js"

import Template from "./pages/Template.js"

import NotFound from "../_common/pages/NotFound.js"
import setupWebPushNotifications from "../_common/scripts/webPush.js"

// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
    return <Layout />;
}

async function bootstrap() {
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

    if (window.session.userId) {
        const response = await fetch(
            `${apiBaseUrl}/v3/users?id=${window.session.userId}`,
            {
                credentials: "include",
            }
        );

        const data = await response.json()

        window.session.user = data.items[0];

        setupWebPushNotifications();
    }

    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <HelmetProvider>
                <I18nextProvider i18n={i18n}>
                    <ModalProvider>
                        <BrowserRouter>
                            <ToastContainer />
                            <CaptchaPortal siteKey={window.config.integrations.hcaptcha} />
                            <Messages />
                            <Routes>
                                <Route 
                                    path="/template/:templateId/:categoryId?/:blockId?" 
                                    element={<Template />} 
                                />

                                <Route element={<RootLayout />}>
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/analytics" element={<Analytics />} />
                                    <Route path="/content" element={<Content />} />

                                    <Route path="/templates" element={<Templates />} />
                                    <Route path="/datasets" element={<Datasets />} />

                                    <Route path="/trash" element={<Trash />} />

                                    <Route path="/404" element={<NotFound />} />
                                    <Route path="*" element={<Navigate to="/404" replace />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </ModalProvider>
                </I18nextProvider>
            </HelmetProvider>
        </React.StrictMode>
    )
}

bootstrap();
