/* eslint-disable */

export {};

import type { Env, Config } from "../../../../app.config.ts";

export type ClientConfig = {
    useNerdFonts: Env["USE_NERDFONTS"];
    theme: Config["theme"];
    metadata: Config["metadata"];
    domains: Config["domains"];
    integrations: {
        hcaptcha: Config["integrations"]["hcaptcha"]
        oauth2: Config["integrations"]["oauth2"]
    }
};

export type ClientSession = {
    sessionId: string;
    userId: string;
    userId: string;
    permissions: {
        value: number;
        array: string[];
    };
    locale: string;
    timezone: string;
};

declare global {
    interface Window {
        config: ClientConfig,
        session: ClientSession,
        ws: any;
    }
}