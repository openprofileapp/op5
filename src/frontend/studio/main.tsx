import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { I18nextProvider } from "react-i18next"

import i18n from "../_common/i18n.js"

import isGateway from "../_common/helpers/isGateway.js"

import "../_common/styles/tailwind.css";
import "../_common/styles/app.css"
import "./scripts/main.js";

const style = document.createElement("style");

style.textContent = `
@font-face {
    font-family: "Alexandria";
    src: url("https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}/fonts/alexandria/AlexandriaVariableFont.ttf") format("truetype");
}

@font-face {
    font-family: "NerdFont";
    src: url("https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}/fonts/jetbrainsmono/JetBrainsMonoNerdFontPropo-Regular.ttf") format("truetype");
}
`;

document.head.appendChild(style);

// Have a display 503 scripts that re-renders the full page when recieving
// { action: "DISPLAY_503" }

import Layout from "./Layout.js"
import ToastContainer from "../_common/components/ToastContainer.js"
import CaptchaPortal from "../_common/components/CaptchaPortal.js"
import AskAlice from "../_common/components/AskAlice.js"

import Dashboard from "./pages/Dashboard.js"
import Analytics from "./pages/Analytics.js"
import CharacterTemplate from "./components/CharacterTemplate.js"

import ComingSoon from "../_common/pages/ComingSoon.js"
import NotFound from "../_common/pages/NotFound.js"

async function bootstrap() {
    const response = await fetch(
        `https://${window.config.domains.auth}/session`,
        {
            credentials: "include",
        }
    );

    window.session = await response.json();

    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <HelmetProvider>
                <I18nextProvider i18n={i18n}>
                    <BrowserRouter>
                        <ToastContainer />
                        <CaptchaPortal siteKey={window.config.integrations.hcaptcha} />
                        <AskAlice />
                        <Routes>
                            <Route path="/character" element={<CharacterTemplate />} />

                            <Route element={<Layout />}>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/content" element={<ComingSoon />} />

                                <Route path="/404" element={<NotFound />} />
                                <Route path="*" element={<Navigate to="/404" replace />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </I18nextProvider>
            </HelmetProvider>
        </React.StrictMode>
    )
}

bootstrap();