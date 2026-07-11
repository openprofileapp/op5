import { AdvancedError, I18nService } from "kage-library";

import { db } from "../databases/db.js";
import { UserAccountType } from "../types/userAccount.type.js";
import { config } from "../../../../app.config.js";
import { UserConnectionType } from "../types/userConnection.type.js";

type MfaMethod =
    | "totp"
    | "biometric"
    | "connection"
    | "qr"
    | "backup";

export default async function getMfaMethods(
    userId: string
): Promise<{ methods: MfaMethod[] }> {
    if (!userId) {
        // DEV NOTE: Load this once per session call and save in req.i18n
        const i18n = await I18nService.load(
            { 
                localesPath: "/public/locales", 
                locale: "en", 
                defaultLocale: config.metadata.locale 
            }
        );
        
        throw new AdvancedError({
            code: 401,
            message: i18n.t("responses.noAccount"),
        })
    }

    const methods: MfaMethod[] = [];

    // TOTP
    const userAccountResult = db.accounts.query<UserAccountType>(
        `SELECT 
            isMfaEnabled, 
            totpSecret 
        FROM users 
        WHERE id = ? LIMIT 1`,
        [userId]
    );

    if (!userAccountResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching account",
            details: userAccountResult.error
        })
    }

    if (userAccountResult.rowCount < 1) {
        throw new AdvancedError({
            code: 404,
            message: "Account not found"
        })
    }

    if (!userAccountResult.rows[0].isMfaEnabled) return { methods }

    if (userAccountResult.rows[0].totpSecret) methods.push("totp");

    // Connections
    const userConnectionsResult = db.accounts.query<UserConnectionType>(
        `SELECT 
            isMfa,
        FROM connections 
        WHERE userId = ?`,
        [userId]
    );

    if (!userConnectionsResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching connections",
            details: userConnectionsResult.error
        })
    }

    if (userConnectionsResult.rowCount < 1) {
        throw new AdvancedError({
            code: 404,
            message: "Connection not found"
        })
    }

    if (userConnectionsResult.rowCount > 0) methods.push("connection");

    if (methods.length > 0) {
        methods.push("qr");
        methods.push("backup");
    }

    return { methods };
}