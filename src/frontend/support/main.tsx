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
import { cdnBaseUrl } from "../_common/scripts/domains.js"

import "../_common/styles/tailwind.css"
import "../_common/styles/app.css"
import "./scripts/main.js"

import NotFound from "../_common/pages/NotFound.js"
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

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <HelmetProvider>
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/en-us/article/*" element={<Article />} />

                        <Route path="/404" element={<NotFound />} />
                        <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                </BrowserRouter>
            </I18nextProvider>
        </HelmetProvider>
    </React.StrictMode>
)
