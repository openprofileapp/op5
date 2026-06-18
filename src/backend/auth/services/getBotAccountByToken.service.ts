import { AdvancedError } from 'kage-library';

import { db } from '../databases/db.js';
import { BotAccountType } from '../types/botAccount.type.js';
import { UserAccountType } from '../types/userAccount.type.js';
import PlatformPermissionsService from '../../_common/services/platformPermissions.service.js';

export default function getBotAccountByToken(token: string) {
    const botResult = db.accounts.query<BotAccountType>("SELECT * FROM bots WHERE token = ? LIMIT 1", [token]);

    if (botResult.success) {
        if (botResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Account not found" });

        const row = botResult.rows[0]

        if (row.isDeleted) throw new AdvancedError({ code: 404, message: "Account not found" });
        if (row.isSuspended) throw new AdvancedError({ code: 403, message: "This account is suspended" });

        const userResult = db.accounts.query<UserAccountType>("SELECT * FROM users WHERE id = ? LIMIT 1", [row.ownerId]);

        if (userResult.success) {
            if (userResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Account not found" });

            const row = userResult.rows[0];

            if (row.isDeleted) throw new AdvancedError({ code: 404, message: "Account not found" });
            if (row.isSuspended) throw new AdvancedError({ code: 403, message: "This account is suspended" });
        } else {
            throw new AdvancedError({ 
                code: 500, 
                message: userResult.error as string || "An error occurred while fetching account" 
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { token, isSuspended, isDeleted, ...rest } = row;
        
        return {
            ...rest,
            permissions: {
                value: rest.permissions,
                array: PlatformPermissionsService.decode(rest.permissions)
            }
        };
    } else {
        throw new AdvancedError({ 
            code: 500, 
            message: botResult.error as string || "An error occurred while fetching account" 
        });
    }
}