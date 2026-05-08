import type { Request, Response, NextFunction } from 'express';
import { I18nService } from "kage-library"

import { config } from '../../../../app.config.js';

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    
    const i18n = await I18nService.load(
        { 
            localesPath: "/public/locales", 
            locale: "en", 
            defaultLocale: config.metadata.locale 
        }
    );

    if (config.maintenance.isEnabled) {
        return res.send(i18n.t("maintenance.reason"));
    } else {
        next();
    } 
};

