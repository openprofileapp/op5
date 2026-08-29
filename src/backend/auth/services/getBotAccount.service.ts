import { AdvancedError } from 'kage-library';

import { db } from '../databases/db.js';
import { BotAccountType } from '../types/botAccount.type.js';
import { assertDbSuccess } from '../../../_common/asserts/dbSuccess.assert.js';
import { i18n } from '../../_common/instances.js';
import { assertNotNull } from '../../../_common/asserts/notNull.assert.js';
import PlatformPermissionsService from '../../_common/services/platformPermissions.service.js';
import { UserAccountType } from '../types/userAccount.type.js';

export default function getBotAccountService(botToken: string) {
    const botResult = db.accounts.query<BotAccountType>(
        "SELECT * FROM bots WHERE token = ? LIMIT 1", 
        [botToken]
    );

    assertDbSuccess(botResult);

    if (botResult.rowCount < 1) {
        throw new AdvancedError({ 
            code: 404, 
            message: i18n.t("responses.accountNotFound")
        });
    }

    const botRow = botResult.rows[0]

    assertNotNull(botRow);

    if (botRow.isDeleted) {
        throw new AdvancedError({ 
            code: 404,
            message: i18n.t("responses.accountNotFound")
        });
    }

    if (botRow.isSuspended) {
        throw new AdvancedError({ 
            code: 403,
            message: i18n.t("responses.accountSuspended")
        });
    }

    const userResult = db.accounts.query<UserAccountType>(
        "SELECT * FROM users WHERE token = ? LIMIT 1", 
        [botRow.ownerId]
    );

    assertDbSuccess(userResult);

    if (userResult.rowCount < 1) {
        throw new AdvancedError({ 
            code: 404, 
            message: i18n.t("responses.accountNotFound")
        });
    }

    const userRow = userResult.rows[0]

    assertNotNull(userRow);

    if (userRow.isDeleted) {
        throw new AdvancedError({ 
            code: 404,
            message: i18n.t("responses.accountNotFound")
        });
    }

    if (userRow.isSuspended) {
        throw new AdvancedError({ 
            code: 403,
            message: i18n.t("responses.accountSuspended")
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, isSuspended, isDeleted, ...rest } = botRow;
    
    return {
        ...rest,
        permissions: {
            value: rest.permissions,
            array: PlatformPermissionsService.decode(rest.permissions)
        }
    };
}
