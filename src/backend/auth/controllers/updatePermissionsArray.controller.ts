import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import { UserAccountType } from "../types/userAccount.type.js";
import { PlatformPermissionNameType } from "../../../_common/types/permissions.type.js";

export const updatePermissionsArrayController = async (req: Request, res: Response) => {
    try {
        const { id, action } = req.params;
        const { permissions } = req.body as {
            permissions: PlatformPermissionNameType[];
        };

        await assertApiSecret(req);

        const getResult = db.accounts.query<UserAccountType>(
            `
                SELECT *
                FROM users
                WHERE id = ?
            `,
            [id]
        );

        assertDbSuccess(getResult);

        const oldPermissionsArray = PlatformPermissionsService.decode(
            getResult.rows?.[0].permissions
        );

        const newPermissionsArray = permissions;

        let finalPermissionsArray: PlatformPermissionNameType[];

        if (action === "add") {
            finalPermissionsArray = [
                ...new Set([
                    ...oldPermissionsArray,
                    ...newPermissionsArray
                ])
            ];
        } else {
            finalPermissionsArray = oldPermissionsArray.filter(
                permission => !newPermissionsArray.includes(permission)
            );
        }

        const finalPermissions = PlatformPermissionsService.encode(
            finalPermissionsArray
        );

        const result = db.accounts.query(
            `
                UPDATE users
                SET permissions = ?
                WHERE id = ?
            `,
            [
                finalPermissions,
                id
            ]
        );

        assertDbSuccess(result);

        return res.status(200).json({
            ok: true
        });
    } catch (error) {
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
