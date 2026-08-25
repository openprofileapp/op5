import type { Request, Response, NextFunction } from 'express';

import { config } from '../../../../app.config.js';
import { i18n } from '../instances.js';

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (config.maintenance.isEnabled) {
        return res.send(i18n.t("maintenance.reason"));
    } else {
        next();
    } 
};
