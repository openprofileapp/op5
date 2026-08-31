import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

import { cdnBaseUrl } from "./scripts/domains.js";

const config = window.config;

const initialLocale = (
    localStorage.getItem("locale") || 
    navigator.language || 
    config.metadata.locale
).toLowerCase();

const baseLocale = initialLocale.split("-")[0];
const defaultLocale = config.metadata.locale.toLowerCase();

i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
        lng: initialLocale,

        fallbackLng: [
            initialLocale,
            baseLocale,
            defaultLocale
        ],

        backend: {
            loadPath: `${cdnBaseUrl}/locales/{{lng}}.json?v=${config.metadata.version.semver}`,
        },

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },
    });

export default i18n;
