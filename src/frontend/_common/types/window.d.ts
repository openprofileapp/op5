/* eslint-disable */

export {};

import type { Env, Config } from "../../../../app.config.ts";
import { GetUserType } from "../../../_common/types/user.type.ts";

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
    userId: string;
    permissions: {
        value: number;
        array: string[];
    };
    locale: string;
    timezone: string;
    delegatedAccounts?: string[];
    user?: GetUserType
};

declare global {
    interface Window {
        config: ClientConfig,
        session: ClientSession,
        ws: any;
    }
}
