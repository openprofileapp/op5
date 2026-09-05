import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";

export const updateNotficationsController = async (req: Request, res: Response) => {
    try {
        const { type, id } = req.params;
        const { 
            isContentSelected,
            isCollaborationSelected,
            isCommentsSelected,
            isInteractionsSelected,
            isMessagesSelected,
            duration,
            isIndefinite,
            date
        } = req.body;

        await assertBearer(req);
        assertAccount(req.session);
        assertNotNull([type, id]);
        assertPlatformPermissions(req.session, "WRITE");

        const validTypes: string[] = [
            "mute",
            "subscriptions"
        ];

        if (!validTypes.includes(type as string)) {
            assertNotNull(null);
        }

        if (type === "mute") {
            const result = db.notifications.query(
                `INSERT INTO mutes (source, target, duration, isIndefinite, date) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(source, target) DO UPDATE SET
                    duration = EXCLUDED.duration,
                    isIndefinite = EXCLUDED.isIndefinite,
                    date = EXCLUDED.date`,
                [req.session.userId, id, duration, isIndefinite ? 1 : 0, date]
            );

            assertDbSuccess(result);
        } else if (type === "subscriptions") {
            const result = db.notifications.query(
                `INSERT INTO subscriptions (
                    source, 
                    target, 
                    isSubscribedToContent, 
                    isSubscribedToCollaborationChanges, 
                    isSubscribedToNewComments, 
                    isSubscribedToNewInteractions, 
                    isSubscribedToNewMessages
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source, target) DO UPDATE SET
                    isSubscribedToContent = EXCLUDED.isSubscribedToContent,
                    isSubscribedToCollaborationChanges = EXCLUDED.isSubscribedToCollaborationChanges,
                    isSubscribedToNewComments = EXCLUDED.isSubscribedToNewComments,
                    isSubscribedToNewInteractions = EXCLUDED.isSubscribedToNewInteractions,
                    isSubscribedToNewMessages = EXCLUDED.isSubscribedToNewMessages`,
                [
                    req.session.userId,
                    id,
                    isContentSelected ? 1 : 0,
                    isCollaborationSelected ? 1 : 0,
                    isCommentsSelected ? 1 : 0,
                    isInteractionsSelected ? 1 : 0,
                    isMessagesSelected ? 1 : 0
                ]                              
            );

            assertDbSuccess(result);
        }

        res.status(200).json({
            ok: true
        });
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
