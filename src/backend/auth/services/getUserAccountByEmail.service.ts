import { AdvancedError } from 'kage-library';

import { db } from '../server.js';
import { AccountEmailType } from '../../_common/types/queries/accountEmail.type.js';
import { UserAccountType } from '../../_common/types/queries/userAccount.type.js';
import PlatformPermissionsService from '../../_common/services/platformPermissions.service.js';

export default function getUserAccountByEmail(email: string) {
    const emailResult = db.accounts.query("SELECT * FROM emails WHERE email = ? LIMIT 1", [email]);

    if (emailResult.success) {
        if (emailResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Email not found" });

        const row = emailResult.rows[0] as AccountEmailType;

        // In the future, if a password system is implemented, ensure (row.isConfirmed === true)

        const userResult = db.accounts.query("SELECT * FROM users WHERE id = ? LIMIT 1", [row.userId]);

        if (userResult.success) {
            if (userResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Account not found" });

            const row = userResult.rows[0] as UserAccountType;

            // MAYBE REMOVE THIS OR PROVIDE A DIFFERENT ERROR CODE
            if (row.isDeleted) throw new AdvancedError({ code: 404, message: "Account not found" });
            if (row.isSuspended) throw new AdvancedError({ code: 403, message: "This account is suspended" });

            return {
                ...row,
                permissions: {
                    value: row.permissions,
                    array: PlatformPermissionsService.decode(row.permissions)
                }
            };
        } else {
            throw new AdvancedError({ 
                code: 500, 
                message: userResult.error as string || "An error occurred while fetching account" 
            });
        }
    } else {
        throw new AdvancedError({ 
            code: 500, 
            message: emailResult.error as string || "An error occurred while fetching email" 
        });
    }
}