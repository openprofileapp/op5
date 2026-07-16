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

import ToastContainer from "../_common/components/ToastContainer.js"
import CaptchaPortal from "../_common/components/CaptchaPortal.js"
import AskAlice from "../_common/components/AskAlice.js"

import Home from "./pages/Home.js"
import Search from "./pages/Search.js"
import Browse from "./pages/Browse.js"
import Partners from "./pages/Partners.js"
import Premium from "./pages/Premium.js"

import Onboarding from "./pages/account/Onboarding.js"

import ComingSoon from "../_common/pages/ComingSoon.js"
import NotFound from "../_common/pages/NotFound.js"
import UserProfile from "./pages/UserProfile.js"

import Template from "./pages/Template.js"

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
                            <Route path="/" element={<Home />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/universes" element={<ComingSoon />} />
                            <Route path="/library" element={<ComingSoon />} />
                            <Route path="/partners" element={<Partners />} />
                            <Route path="/premium" element={<Premium />} />
                            <Route path="/popular" element={<Browse />} />

                            <Route path="/account/onboarding" element={<Onboarding />} />

                            <Route path="/user/:id" element={<UserProfile />} />
                            <Route path="/:id" element={<Template />} />
                            {/* <Route path="user/:userId/profile/:id" element={<CharacterProfile />} /> */}

                            <Route path="/404" element={<NotFound />} />
                            <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>
                    </BrowserRouter>
                </I18nextProvider>
            </HelmetProvider>
        </React.StrictMode>
    )
}

bootstrap();