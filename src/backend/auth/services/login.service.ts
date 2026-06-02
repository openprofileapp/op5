import type { Request, Response } from 'express';

import { AdvancedError, QueryResult } from 'kage-library';

import { db } from '../server.js';
import { BotAccount } from '../../_common/types/queries/botAccount.type.js';
import { UserAccount } from '../../_common/types/queries/userAccount.type.js';
import PlatformPermissionsService from '../../_common/services/platformPermissions.service.js';

export default async function login(req: Request, res: Response) {
    // Bot Account
    const authHeader = req.headers.authorization as string || req.headers.Authorization as string;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const authToken = authHeader.split(" ")[1];

        const botResult: QueryResult = db.accounts.query("SELECT * FROM bots WHERE token = ? LIMIT 1", [authToken]);

        if (botResult.success) {
            if (botResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Account not found" });

            const row = botResult.rows[0] as BotAccount;

            if (row.isDeleted) throw new AdvancedError({ code: 404, message: "Account not found" });
            if (row.isSuspended) throw new AdvancedError({ code: 403, message: "This account is suspended" });

            const userResult: QueryResult = db.accounts.query("SELECT * FROM users WHERE id = ? LIMIT 1", [row.ownerId]);

            if (userResult.success) {
                if (userResult.rowCount < 1) throw new AdvancedError({ code: 404, message: "Account not found" });

                const row = userResult.rows[0] as UserAccount;

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
}