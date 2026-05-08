/* eslint-disable */

export {};

import type { Env, Config } from "../../../../app.config.ts";

export type ClientConfig = {
    useNerdFonts: Env["USE_NERDFONTS"];
    theme: Config["theme"];
    metadata: Config["metadata"];
    domains: Config["domains"];
};

declare global {
    interface Window {
        config: ClientConfig,
        ws: any;
    }
}