import { AdvancedError } from "kage-library";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import { i18n } from "../instances.js";
import { PlatformPermissionNameType } from "../../../_common/types/permissions.type.js";
import PlatformPermissionsService from "../services/platformPermissions.service.js";

/**
 * Asserts that the current session must have the requested permissions.
 *
 * @example
 * assertPlatformPermissions(req.session, "VIEW");
 */
export function assertPlatformPermissions(
    session: ValidSessionType, 
    requiredPermission: PlatformPermissionNameType | PlatformPermissionNameType[]
): void {
    if (!PlatformPermissionsService.has(
        session.permissions.value, 
        requiredPermission
    )) {
        throw new AdvancedError({
            code: 401,
            message: i18n.t("responses.unauthorized")
        })
    }
}
