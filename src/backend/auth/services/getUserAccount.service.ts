import { AdvancedError } from 'kage-library';

import { ConnectionNameType, ConnectionType } from '../types/connection.type.js';
import { db } from '../databases/db.js';
import { assertDbSuccess } from '../../../_common/asserts/dbSuccess.assert.js';
import { i18n } from '../../_common/instances.js';
import { EmailType } from '../types/email.type.js';
import { UserAccountType } from '../types/userAccount.type.js';
import { assertNotNull } from '../../../_common/asserts/notNull.assert.js';
import PlatformPermissionsService from '../../_common/services/platformPermissions.service.js';

type Props = {
    email?: string;
    externalConnectionName?: ConnectionNameType;
    externalConnectionId?: string;
}

function getUserAccountByEmail(email: string) {
    const result = db.accounts.query<EmailType>(
        "SELECT * FROM emails WHERE email = ? LIMIT 1", 
        [email]
    );

    assertDbSuccess(result);

    return result?.rows?.[0] ?? null;
}

export default function getUserAccountService({
    email, 
    externalConnectionName,
    externalConnectionId, 
}: Props) {
    let row: EmailType | ConnectionType;

    if (email && (!externalConnectionName || !externalConnectionId)) {
        row = getUserAccountByEmail(email);
    } else {
        assertNotNull([externalConnectionName, externalConnectionId]);

        const result = db.accounts.query<ConnectionType>(
            `SELECT * FROM connections WHERE connectionName = ? AND connectionId = ? LIMIT 1`, 
            [externalConnectionName, externalConnectionId]
        );

        assertDbSuccess(result);

        if (result.rowCount === 0) {
            if (externalConnectionName === "GOOGLE" && email) {
                row = getUserAccountByEmail(email);
            }
        } else {
            row = result.rows[0]
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (!row) return null;

    const result = db.accounts.query<UserAccountType>(
        "SELECT * FROM users WHERE id = ? LIMIT 1", 
        [row.userId]
    );

    assertDbSuccess(result);

    if (result.rowCount < 1) {
        throw new AdvancedError({ 
            code: 404, 
            message: i18n.t("responses.accountNotFound")
        });
    }

    const userRow = result.rows[0]

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
    const { isSuspended, isDeleted, ...rest } = userRow;
    
    return {
        ...rest,
        permissions: {
            value: rest.permissions,
            array: PlatformPermissionsService.decode(rest.permissions)
        }
    };
}
