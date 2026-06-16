import { AdvancedError } from 'kage-library';

import { db } from '../server.js';
import { LoginConnectionType } from '../../_common/types/queries/loginConnection.type.js';
import { UserAccountType } from '../../_common/types/queries/userAccount.type.js';
import PlatformPermissionsService from '../../_common/services/platformPermissions.service.js';

export default function getUserAccountByExternalId(service: string, id: string) {
    const connectionResult = db.accounts.query<LoginConnectionType>(
        "SELECT * FROM connections WHERE connectionName = ? AND connectionId = ? LIMIT 1", 
        [service, id]
    );

    if (connectionResult.success) {
        if (connectionResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Connection not found" });

        const row = connectionResult.rows[0];

        const userResult = db.accounts.query<UserAccountType>("SELECT * FROM users WHERE id = ? LIMIT 1", [row.userId]);

        if (userResult.success) {
            if (userResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Account not found" });

            const row = userResult.rows[0]

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
            message: connectionResult.error as string || "An error occurred while fetching connection" 
        });
    }
}