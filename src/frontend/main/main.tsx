import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { I18nextProvider } from "react-i18next"

import i18n from "../_common/i18n.js"

import setupWebPushNotifications from "./scripts/webPush.js"
import { apiBaseUrl, cdnBaseUrl } from "../_common/scripts/domains.js"
import { banner } from "../_common/scripts/banner.js"

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

import Home from "./pages/Home.js"
import Search from "./pages/Search.js"
import Browse from "./pages/Browse.js"
import Partners from "./pages/account/Partners.js"
import Premium from "./pages/Premium.js"

import Onboarding from "./pages/account/Onboarding.js"

import ComingSoon from "../_common/pages/ComingSoon.js"
import NotFound from "../_common/pages/NotFound.js"
import Unavailable from "../_common/pages/Unavailable.js"

import Template from "./pages/Template.js"
import { verifySession } from "../_common/scripts/session.js"

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
                    <BrowserRouter>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/search" element={<Search />} />
                                <Route path="/universes" element={<ComingSoon />} />

                                <Route path="/trending" element={<Browse />} />
                                <Route path="/popular" element={<Browse />} />
                                <Route path="/recent" element={<Browse />} />
                                <Route path="/browse" element={<Browse />} />
                                <Route path="/browse/:tag" element={<Browse />} />

                                <Route path="/premium" element={<Premium />} />

                                <Route path="/account/onboarding" element={<Onboarding />} />
                                <Route path="/account/library" element={<ComingSoon />} />
                                <Route path="/account/partners" element={<Partners />} />
                                
                                <Route path="/user/:id" element={<Template />} />
                                {/* <Route path="character/:id" element={<CharacterProfile />} /> */}

                                <Route path="/503" element={<Unavailable />} />
                                <Route path="/404" element={<NotFound />} />
                                <Route path="*" element={<Navigate to="/404" replace />} />
                            </Routes>
                        </Layout>
                    </BrowserRouter>
                </I18nextProvider>
            </HelmetProvider>
        </React.StrictMode>
    )
}

bootstrap();
