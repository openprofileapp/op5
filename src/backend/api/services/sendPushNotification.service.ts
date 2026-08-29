import webPush from "web-push";

import { NotificationNameType } from "../../../_common/types/notification.type.js";
import { GeoIpType } from "../../../_common/types/geoIp.type.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../databases/db.js";
import { config } from "../../../../app.config.js";
import { WebPushType } from "../types/webpush.type.js";
import { i18n } from "../../_common/instances.js";
import { log } from "../instances.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import createNotificationBody from "../../../_common/helpers/createNotificationBody.js";
import whatIs from "../helpers/whatIs.js";

webPush.setVapidDetails(
    `https://${config.domains.main}`,
    config.integrations.webPush,
    getEnv("VAPID_PRIVATE") as string,
);

type Props = {
    sourceId?: string;
    targetId?: string;
    count?: number;
    geoIp?: GeoIpType;
};

/**
 * Sends a predefined push notification an account
 * @param {string} userId - the recipient (required)
 * @param {string} type - the type of notification (required)
 * @param {string} {} - additional data (optional)
 */
export default async function sendPushNotificationService(
    userId: string,
    type: NotificationNameType,
{
    sourceId,
    targetId,
    count,
    geoIp
}: Props = {}): Promise<void> {    
    assertNotNull([userId, type]);

    // DEVELOPER NEEDED: Log push notifications to an audit log and clear it every hour.
    // If the payload matches the one in the audit, do not send it.

    const result = db.users.query<WebPushType>(
        `SELECT * FROM webpush WHERE userId = ?`,
        [userId]
    );

    assertDbSuccess(result);

    if (result.rowCount === 0) return;

    const body = createNotificationBody(type);

    assertNotNull(body);

    let source;
    let target;
    let formattedBody = body;

    if (body.includes("{") || body.includes("}")) {
        if (sourceId) {
            source = whatIs(sourceId);
            assertNotNull(source);
            formattedBody = formattedBody.replace(
                "{SOURCE}", 
                source.displayName || source.id
            );
        }

        if (targetId) {
            target = whatIs(targetId);
            assertNotNull(target);
            formattedBody = formattedBody.replace(
                "{TARGET}", 
                target.id === userId ? "you" : (target.displayName || target.id)
            );
        }

        if (count) {
            formattedBody = formattedBody.replace(
                "{COUNT}", 
                count.toString()
            );
        }
    }

    let icon;

    if (type.includes("MILESTONE")) {
        icon = `https://${config.domains.cdn}/crop/circle?url=https://${config.domains.cdn}${target?.avatar}`
    } else {
        icon = 
            targetId !== userId 
                ? `https://${config.domains.cdn}/crop/duo?sourceUrl=https://${config.domains.cdn}${source?.avatar}&targetUrl=https://${config.domains.cdn}${target?.avatar}` 
                : source?.avatar 
                    ? `https://${config.domains.cdn}/crop/circle?url=https://${config.domains.cdn}${source?.avatar}`
                    : `https://${config.domains.cdn}/crop/circle?url=https://${config.domains.cdn}${config.metadata.assets.icon}`
    }

    const payload = JSON.stringify({
        title: config.metadata.name,
        body: formattedBody,
        icon,
        url: `https://${config.domains.main}/account/notifications`,
    });

    const sendPromises = result.rows.map(async row => {
        const subscription = {
            endpoint: row.endpoint,
            keys: JSON.parse(row.keys)
        };

        try {
            return await webPush.sendNotification(subscription, payload);
        } catch (error: unknown) {
            const statusCode = (error as { statusCode?: number })?.statusCode;

            if (statusCode === 404 || statusCode === 410) {
                db.users.query(
                    "DELETE FROM webpush WHERE userId = ? AND endpoint = ?", 
                    [row.userId, row.endpoint]
                );
                return;
            } else {
                const errorMessage = error instanceof Error ? error.message : String(error);

                log.client.error(
                    i18n.t("responses.webpush"),
                    { userId: row.userId, message: errorMessage }
                ).save()
            }
        }
    });

    await Promise.all(sendPromises);
}
