import React from "react"
import ReactDOM from "react-dom/client"

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

import Layout from "./Layout.js";

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
            <Layout />
        </React.StrictMode>
    );
}

bootstrap();