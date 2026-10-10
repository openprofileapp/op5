import { Logger } from "kage-library";

import { config } from "../../../app.config.js";

export const log = new Logger({
    path: "/logs/websocket",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.main
});
