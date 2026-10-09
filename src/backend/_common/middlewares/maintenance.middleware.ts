import type { Request, Response, NextFunction } from 'express';

import { config } from '../../../../app.config.js';
import { i18n } from '../instances.js';

export const maintenanceMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const clientSidedServers = [
        config.domains.main,
        config.domains.studio,
        config.domains.support,
        config.domains.cdn,
        config.domains.discord_api
    ]

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (clientSidedServers.includes(req.hostname)) {
        return next();
    }

    if (config.maintenance.isEnabled) {
        return res.status(503).send(i18n.t('maintenance.reason'));
    }

    return next();
};
