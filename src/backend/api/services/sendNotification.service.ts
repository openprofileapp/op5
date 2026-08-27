import { NotificationNameType } from "../../../_common/types/notification.type.js";
import { GeoIpType } from "../../../_common/types/geoIp.type.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../databases/db.js";
import sendPushNotificationService from "./sendPushNotification.service.js";

export const notificationMilestones = [ 
    10, 25, 50, 75,
    100, 250, 500, 750, 
    1000, 2500, 5000, 7500, 
    10000, 25000, 50000, 75000, 
    100000, 250000, 500000, 750000, 
    1000000, 2500000, 5000000, 7500000, 
    10000000, 25000000, 50000000, 75000000, 
    100000000, 250000000, 500000000, 750000000, 
    1000000000, 2500000000, 5000000000, 7500000000, 
    10000000000
];

type Props = {
    sourceId?: string;
    targetId?: string;
    count?: number;
    geoIp?: GeoIpType;
};

/**
 * Sends a predefined notification an account
 * @param {string} userId - the recipient (required)
 * @param {string} type - the type of notification (required)
 * @param {string} {} - additional data (optional)
 */
export default async function isValidService(
    userId: string,
    type: NotificationNameType,
{
    sourceId,
    targetId,
    count,
    geoIp
}: Props = {}): Promise<void> {    
    assertNotNull([userId, type]);

    // Never send milestone notifications twice

    const data = JSON.stringify({
        ...(sourceId && { sourceId }),
        ...(targetId && { targetId }),
        ...(count && { count }),
        ...(geoIp && { geoIp })
    });

    let isValid = false;

    db.users.transaction(q => {
        const result = q(
            `DELETE FROM notifications WHERE userId = ? AND type = ? AND data = ?`,
            [userId, type, data]
        );

        assertDbSuccess(result);

        if (result.changes === 0) {
            isValid = true

            const result = q(
                `INSERT INTO notifications (userId, type, data) VALUES (?, ?, ?)`,
                [userId, type, data]
            )

            assertDbSuccess(result);
        }
    });

    if (isValid) {
        await sendPushNotificationService(    
            userId,
            type,
            {
                sourceId,
                targetId,
                count,
                geoIp
            }
        )
    }
}
