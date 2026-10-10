import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { I18nextProvider } from "react-i18next"

import i18n from "../_common/i18n.js"
import { ModalProvider } from "../_common/hooks/ModalContext.hook.js"

import { apiBaseUrl } from "../_common/scripts/domains.js"
import { banner } from "../_common/scripts/banner.js"
import { verifySession } from "../_common/scripts/session.js"
import setupWebPushNotifications from "../_common/scripts/webPush.js"
import { applyTheme, fonts } from "../_common/scripts/themes.js"
import { cookie } from "../_common/scripts/cookies.js";
import { getImportantChanges } from "../_common/scripts/getImportantChanges.js"

import "../_common/styles/tailwind.css";
import "../_common/styles/app.css"
import "./scripts/main.js";

const style = document.createElement("style");

style.textContent = fonts;

document.head.appendChild(style);

import Layout from "./Layout.js"

import ToastContainer from "../_common/components/ToastContainer.js"
import CaptchaPortal from "../_common/components/modals/CaptchaPortal.js"
import Messages from "../_common/components/Messages.js"

import Dashboard from "./pages/Dashboard.js"
import Analytics from "./pages/Analytics.js"
import Content from "./pages/Content.js"
import Templates from "./pages/Templates.js"
import Blocks from "./pages/Blocks.js"
import Datasets from "./pages/Datasets.js"
import Trash from "./pages/Trash.js"

import Template from "./pages/Template.js"
import Block from "./pages/Block.js"

import Unavailable from "../_common/pages/Unavailable.js"
import NotFound from "../_common/pages/NotFound.js"
import Maintenance from "../_common/pages/Maintenance.js"

// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
    return <Layout />;
}

async function bootstrap() {
    if (!window.config.maintenance.isEnabled) {
        await verifySession();
        await getImportantChanges();

        if (!cookie.get("theme")) {
            cookie.set("theme", "dark");
        }

        applyTheme(cookie.get("theme") ?? "dark");

        if (!cookie.get("locale")) {
            cookie.set(
                "locale", 
                window.session.locale || window.config.metadata.locale
            );
        }

        if (cookie.get("locale")) {
            await i18n.changeLanguage(cookie.get("locale") as string);

            if (
                (
                    cookie.get("locale")?.startsWith("zh") ||
                    cookie.get("locale")?.startsWith("es") ||
                    cookie.get("locale")?.startsWith("hi") ||
                    cookie.get("locale")?.startsWith("ar") ||
                    cookie.get("locale")?.startsWith("ru") ||
                    cookie.get("locale")?.startsWith("id") ||
                    cookie.get("locale")?.startsWith("ja")
                ) &&
                !cookie.get("hasSeenLocaleBanner")
            ) {
                banner.show(
                    i18n.t("banners.locale"),
                    {
                        type: "warning",
                        closeAction: { 
                            onClick: () => {
                                cookie.set("hasSeenLocaleBanner", "true");
                            } 
                        }
                    }
                );
            }
        }

        if (window.session?.userId) {
            const response = await fetch(
                `${apiBaseUrl}/v3/users?id=${window.session.userId}`,
                { credentials: "include" }
            );

            const data = await response.json()

            window.session.user = data.items[0];

            setupWebPushNotifications();
        }
    }

    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <HelmetProvider>
                <I18nextProvider i18n={i18n}>
                    <BrowserRouter>
                        {window.config.maintenance.isEnabled ? (
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
                                        path="/template/:templateId/:categoryId?/:blockId?"
                                        element={<Template />}
                                    />

                                    <Route element={<RootLayout />}>
                                        <Route
                                            path="/"
                                            element={<Navigate to="/dashboard" replace />}
                                        />
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/content" element={<Content />} />
                                        <Route path="/templates" element={<Templates />} />
                                        <Route path="/blocks" element={<Blocks />} />
                                        <Route path="/datasets" element={<Datasets />} />
                                        <Route path="/block/:blockId" element={<Block />} />
                                        <Route path="/trash" element={<Trash />} />

                                        <Route path="/503" element={<Unavailable />} />
                                        <Route path="/404" element={<NotFound />} />
                                        <Route path="*" element={<Navigate to="/404" replace />}/>
                                    </Route>
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
