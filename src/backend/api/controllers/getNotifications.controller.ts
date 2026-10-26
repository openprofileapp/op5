import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../_common/asserts/platformPermissions.assert.js";
import { config } from "../../../../app.config.js";
import { i18n } from "../../_common/instances.js";
import { assertAccount } from "../../_common/asserts/account.assert.js";
import getNotificationsService from "../services/getNotifications.service.js";
import { NotificationNameType } from "../../../_common/types/notification.type.js";

export const getNotificationsController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "VIEW");

        const {
            sortBy,
            page,
            limit = config.limits.assetsPerPage,
            q: query,
        } = req.query;

        const parsedLimit = Number(limit);

        const offset =
            (Number(page) || 1) *
            parsedLimit -
            parsedLimit;

        const characters = getNotificationsService({
            userId: req.session.userId,
            query: query as string,
            sortBy: sortBy as NotificationNameType,
            offset,
            limit: parsedLimit,
        });

        return res.status(200).json({
            ...characters,
            pages: Math.ceil(characters.count / parsedLimit)
        });

    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();

            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        }

        log.unknown.error(error).save();

        return res.status(500).json({
            message: i18n.t("responses.unknown")
        });
    }
};
