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
import { apiBaseUrl } from "../_common/scripts/domains.js"
import { ModalProvider } from "../_common/hooks/ModalContext.hook.js"
import { verifySession } from "../_common/scripts/session.js"
import { banner } from "../_common/scripts/banner.js"
import { applyTheme, fonts } from "../_common/scripts/themes.js"
import { cookie } from "../_common/scripts/cookies.js";

import "../_common/styles/tailwind.css";
import "../_common/styles/app.css"
import "./scripts/main.js";

const style = document.createElement("style");

style.textContent = fonts;

document.head.appendChild(style);

import ToastContainer from "../_common/components/ToastContainer.js"
import CaptchaPortal from "../_common/components/modals/CaptchaPortal.js"
import Messages from "../_common/components/Messages.js"

import NotFound from "../_common/pages/NotFound.js"
import Maintenance from "../_common/pages/Maintenance.js"

import Article from "./pages/Article.js"

async function bootstrap() {
    if (!window.config.maintenance.isEnabled) {
        await verifySession();

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
