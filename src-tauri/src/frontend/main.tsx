import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import platform from "platform";

import "../../../src/frontend/_common/styles/tailwind.css";
import "../../../src/frontend/_common/styles/daisyui.css";

import Home from "./desktop/pages/Home.js";

// eslint-disable-next-line react-refresh/only-export-components
function Root() {
    const isDesktop = platform.os?.family !== "iOS" && platform.os?.family !== "Android";

    return isDesktop ? <Home /> : null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Root />} />
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>
);