import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, Navigate, RouterProvider, Outlet } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { I18nextProvider } from "react-i18next"

import i18n from "../_common/i18n.js"
import { ModalProvider } from "../_common/hooks/ModalContext.hook.js"

import setupWebPushNotifications from "../_common/scripts/webPush.js"
import { apiBaseUrl } from "../_common/scripts/domains.js"
import { banner } from "../_common/scripts/banner.js"
import { verifySession } from "../_common/scripts/session.js"
import { applyTheme, fonts } from "../_common/scripts/themes.js"
import { cookie } from "../_common/scripts/cookies.js";

import "../_common/styles/tailwind.css";
import "../_common/styles/app.css"
import "./scripts/main.js";

const style = document.createElement("style");

style.textContent = fonts;

document.head.appendChild(style);

import Layout from "./Layout.js"

import Home from "./pages/Home.js"
import Search from "./pages/Search.js"
import Browse from "./pages/Browse.js"
import Partners from "./pages/account/Partners.js"
import Premium from "./pages/Premium.js"

import Onboarding from "./pages/account/Onboarding.js"
import MarkdownFile from "./pages/MarkdownFile.js"

import ComingSoon from "../_common/pages/ComingSoon.js"
import NotFound from "../_common/pages/NotFound.js"
import Unavailable from "../_common/pages/Unavailable.js"
import Maintenance from "../_common/pages/Maintenance.js"

import UserProfile from "./pages/UserProfile.js"
import { getImportantChanges } from "../_common/scripts/getImportantChanges.js"

const markdownRoutes = [
    {
        paths: ["/tos", "/terms", "/terms-of-service"],
        fileName: "terms-of-service"
    },
    {
        paths: ["/brand-guidelines"],
        fileName: "brand-guidelines"
    },
    {
        paths: ["/privacy", "/privacy-policy"],
        fileName: "privacy-policy"
    }
];

// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
    return (
        <ModalProvider>
            <Layout>
                <Outlet />
            </Layout>
        </ModalProvider>
    );
}

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/search", element: <Search /> },
            { path: "/universes", element: <ComingSoon /> },

            { path: "/trending", element: <Browse /> },
            { path: "/popular", element: <Browse /> },
            { path: "/recent", element: <Browse /> },
            { path: "/browse", element: <Browse /> },
            { path: "/browse/:tag", element: <Browse /> },

            { path: "/premium", element: <Premium /> },

            { path: "/account/onboarding", element: <Onboarding /> },
            { path: "/account/library", element: <ComingSoon /> },
            { path: "/account/partners", element: <Partners /> },

            { path: "/user/:id", element: <UserProfile /> },

            ...markdownRoutes.flatMap(({ paths, fileName }) =>
                paths.map(path => ({
                    path,
                    element: <MarkdownFile fileName={fileName} />,
                }))
            ),

            { path: "/503", element: <Unavailable /> },
            { path: "/404", element: <NotFound /> },
            { path: "*", element: <Navigate to="/404" replace /> },
        ],
    },
]);

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
                    {window.config.maintenance.isEnabled ? (
                        <RouterProvider
                            router={createBrowserRouter([
                                {
                                    path: "*",
                                    element: <Maintenance />,
                                },
                            ])}
                        />
                    ) : (
                        <RouterProvider router={router} />
                    )}
                </I18nextProvider>
            </HelmetProvider>
        </React.StrictMode>
    );
}

bootstrap();
