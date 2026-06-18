import type { Request, Response } from 'express';

import { config } from '../../../../app.config.js';
import { wc } from '../../_common/instances.js';

export const statusController = async (req: Request, res: Response) => {

    // ADD API SECRET AUTH HERE

    // Do not ping the status server
    const main = await wc.ping(`https://${config.domains.main}`);
    const auth = await wc.ping(`https://${config.domains.auth}/health`);
    const api = await wc.ping(`https://${config.domains.api}/health`);
    const cdn = await wc.ping(`https://${config.domains.cdn}/health`);
    const support = await wc.ping(`https://${config.domains.support}`);
    const nightly = await wc.ping(`https://${config.domains.nightly}`);
    const gateway = await wc.ping(`https://${config.domains.gateway}`);

    res.json({ 
        main,
        auth,
        api, 
        cdn, 
        support,
        nightly,
        gateway 
    });
};