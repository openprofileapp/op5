import path from "path";
import maxmind, { CityResponse } from "maxmind";

import { Identifier, Logger, Snowflake, WebClient } from "kage-library";

import { config } from "../../../app.config.js";

export const log = new Logger({
    path: "/logs/auth",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.api
});

export const snowflake = new Snowflake(config.generation.epoch, 0);

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