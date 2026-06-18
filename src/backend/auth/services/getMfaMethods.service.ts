import type { CookieOptions, Request, Response } from "express";
import net from "node:net";
import DeviceDetector from "node-device-detector";
import { DateTime } from "luxon";
import haversine from "haversine-distance"
import crypto from "crypto";

import { AdvancedError, URL } from "kage-library";

import { config } from "../../../../app.config.js";
import { db,  } from "../databases/db.js";
import { id, log, wc } from "../instances.js";
import PlatformPermissionsService from "../../_common/services/platformPermissions.service.js";
import fetchGeoIp from "../helpers/fetchGeoIp.js";
import { InviteType } from "../../_common/types/queries/invite.type.js";
import { UserAgentType } from "../../_common/types/queries/userAgent.type.js";
import { SessionType } from "../types/session.type.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { AuditApiType } from "../../_common/types/queries/audit.type.js";
import { GeoIpType } from "../types/geoIp.type.js";

type MfaMethods = {
    sessionId?: string;
    userId?: string;
    permissions?: {
        value: string;
        array: string[];
    };
    locale?: string;
    timezone?: string;
    action?: string;
};

export default async function getMfaMethods(userId: string): Promise<MfaMethods> {
    // Update the session row
    const updatedUserSessionResult = db.accounts.query(
        `UPDATE sessions SET
            userAgent = ?,
            inviteCode = ?,
            isConnected = ?,
            lastConnectedDate = ?
        WHERE sessionId = ?
        LIMIT 1`,
        [
            JSON.stringify(formattedUserAgent),
            inviteCode,
            1,
            now,
            sessionId
        ]
    );

    if (!updatedUserSessionResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while updating session",
            details: updatedUserSessionResult.error
        })
    }

    // Display member role for non-logged users
    const role = PlatformPermissionsService.getRole("guest");

    // Return session data
    return {
        sessionId,
        userId: row.userId,
        permissions: {
            value: role.value,
            array: role.array
        },
        locale: rowGeoIpJSON.locale,
        timezone: rowGeoIpJSON.timezone,
        ...(returnMfaToken === true && { mfaToken })
    };
}