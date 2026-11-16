import path from "path";
import maxmind, { CityResponse } from "maxmind";

import { I18nService, Identifier, WebClient } from "kage-library";
import { AutoMod, filters } from "@kagejs/automod";

const { enUS } = filters;
const { expressions, regional } = enUS;

import { config } from "../../../app.config.js";

export const i18n = await I18nService.load(
    { 
        localesPath: "/public/locales", 
        locale: "en", 
        defaultLocale: config.metadata.locale 
    }
);

export const wc = new WebClient({
    crawler: config.crawler,
    useSecureSSL: config.isProduction
});

export const id = new Identifier({
    HASH: { regex: /[a-f0-9]/, length: 32 },
    TOKEN: { regex: /[A-Za-z0-9]/, length: 64 }
});

export const geoip2 = await maxmind.open<CityResponse>(
    path.resolve("data/databases/static/geoip2/cities.mmdb")
);

export const automod = new AutoMod({
    id: "alice",
    name: "Alice",
    group: "main",

    enabled: true,
    severity: "MINOR",
    response: "Alice blocked parts of your text.",

    matchAll: true,

    ignore: {
        obfuscation: false,
        capitalization: false,
        reversed: true, // Experimental reversed text prevention; true is disabled
        spacing: true // Experimental space break prevention; true is disabled
    },

    filters: [
        {
            id: "expressions",
            name: "Expressions Filter",

            severity: "MODERATE",

            blacklist: [
                ...expressions.profanity.blacklist,
                ...expressions.sexual.blacklist
            ],

            whitelist: expressions.offensive.whitelist
        },
        {
            id: "regional",
            name: "Regional Filter",

            severity: "SEVERE",

            blacklist: [
                ...regional.extremism.blacklist,
                ...regional.politics.blacklist
            ]
        },
        {
            id: "experimental",
            name: "Experimental Filter",

            enabled: !config.isProduction,
            severity: "MINOR",

            blacklist: [
                "badword"
            ]
        }
    ]
});
