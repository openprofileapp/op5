import path from "path";
import maxmind, { CityResponse } from "maxmind";

import { Identifier, WebClient } from "kage-library";

import { config } from "../../../app.config.js";

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