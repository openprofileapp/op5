import type { Request, Response } from 'express';

import { 
    WebClient
} from "kage-library";

import { config } from '../../../../app.config.js';

export const statusController = async (req: Request, res: Response) => {
    const wc = new WebClient({
        crawler: config.crawler,
        useSecureSSL: config.isProduction
    });

    // Do not ping the status server
    const api = await wc.ping(`https://${config.domains.api}`);
    const cdn = await wc.ping(`https://${config.domains.cdn}`);
    const main = await wc.ping(`https://${config.domains.main}`);

    res.json({ 
        api, 
        cdn, 
        main 
    });
};