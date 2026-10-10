import type { Request, Response } from 'express';

import { config } from '../../../../app.config.js';
import { wc } from '../../_common/instances.js';
import { assertApiSecret } from '../../_common/asserts/apiSecret.assert.js';

export const statusController = async (req: Request, res: Response) => {
    assertApiSecret(req);

    // Do not ping the status server
    const stable = {
        main: await wc.ping(`https://${config.rawDomains.stable.main}/health`),
        studio: await wc.ping(`https://${config.rawDomains.stable.studio}/health`),
        auth: await wc.ping(`https://${config.rawDomains.stable.auth}/health`),
        api: await wc.ping(`https://${config.rawDomains.stable.api}/health`),
        cdn: await wc.ping(`https://${config.rawDomains.stable.cdn}/health`),
        support: await wc.ping(`https://${config.rawDomains.stable.support}/health`),
        console: await wc.ping(`https://${config.rawDomains.stable.console}/health`),
        gateway: await wc.ping(`https://${config.rawDomains.stable.gateway}`),
        websocket: await wc.ping(`https://${config.rawDomains.stable.websocket}/health`),
        shortlink: await wc.ping(`https://${config.rawDomains.stable.shortlink}/health`),
        discord_api: await wc.ping(`https://${config.rawDomains.stable.discord_api}/health`)
    };

    // Do not ping the status server
    const nightly = {
        main: await wc.ping(`https://${config.rawDomains.nightly.main}/health`),
        studio: await wc.ping(`https://${config.rawDomains.nightly.studio}/health`),
        auth: await wc.ping(`https://${config.rawDomains.nightly.auth}/health`),
        api: await wc.ping(`https://${config.rawDomains.nightly.api}/health`),
        cdn: await wc.ping(`https://${config.rawDomains.nightly.cdn}/health`),
        support: await wc.ping(`https://${config.rawDomains.nightly.support}/health`),
        console: await wc.ping(`https://${config.rawDomains.nightly.console}/health`),
        gateway: await wc.ping(`https://${config.rawDomains.nightly.gateway}`),
        websocket: await wc.ping(`https://${config.rawDomains.nightly.websocket}/health`)
    };

    res.json({
        stable,
        nightly
    });
};
