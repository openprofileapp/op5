import { Logger, Snowflake, WebClient } from "kage-library";

import { config } from "../../../app.config.js";
import { db } from "./databases/db.js";

export const log = new Logger({
    path: "/logs/api",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.api
});

export const snowflake = new Snowflake(config.generation.epoch, 1);

export let wc: WebClient;

async function waitForDB() {
    const check = () => {
        if (
            db?.metadata
        ) {
            wc = new WebClient({
                crawler: config.crawler,
                database: db.metadata,
                useSecureSSL: config.isProduction
            });

            return;
        }

        setTimeout(check, 10);
    };

    check();
}

waitForDB();