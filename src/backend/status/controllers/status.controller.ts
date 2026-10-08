import type { Request, Response } from 'express';

import { config } from '../../../../app.config.js';
import { wc } from '../../_common/instances.js';
import { assertApiSecret } from '../../_common/asserts/apiSecret.assert.js';

export const statusController = async (req: Request, res: Response) => {
    assertApiSecret(req);

    function cleanUrl(url: string) {
        return url.replace("nightly.", "");
    }

    // Do not ping the status server
    const stable = {
        main: await wc.ping(`https://${cleanUrl(config.domains.main)}/health`),
        studio: await wc.ping(`https://${cleanUrl(config.domains.studio)}/health`),
        auth: await wc.ping(`https://${cleanUrl(config.domains.auth)}/health`),
        api: await wc.ping(`https://${cleanUrl(config.domains.api)}/health`),
        cdn: await wc.ping(`https://${cleanUrl(config.domains.cdn)}/health`),
        support: await wc.ping(`https://${cleanUrl(config.domains.support)}/health`),
        console: await wc.ping(`https://${cleanUrl(config.domains.console)}/health`),
        gateway: await wc.ping(`https://${cleanUrl(config.domains.gateway)}`),
        shortlink: await wc.ping(`https://${cleanUrl(config.domains.shortlink)}/health`),
        discord_api: await wc.ping(`https://${cleanUrl(config.domains.discord_api)}/health`)
    };

    // Do not ping the status server
    const nightly = {
        main: await wc.ping(`https://nightly.${cleanUrl(config.domains.main)}/health`),
        studio: await wc.ping(`https://nightly.${cleanUrl(config.domains.studio)}/health`),
        auth: await wc.ping(`https://nightly.${cleanUrl(config.domains.auth)}/health`),
        api: await wc.ping(`https://nightly.${cleanUrl(config.domains.api)}/health`),
        cdn: await wc.ping(`https://nightly.${cleanUrl(config.domains.cdn)}/health`),
        support: await wc.ping(`https://nightly.${cleanUrl(config.domains.support)}/health`),
        console: await wc.ping(`https://nightly.${cleanUrl(config.domains.console)}/health`),
        gateway: await wc.ping(`https://nightly.${cleanUrl(config.domains.gateway)}`)
    };

    res.json({
        stable,
        nightly
    });
};
