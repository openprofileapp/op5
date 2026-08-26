import { AdvancedError } from "kage-library";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import PlatformPermissionsService, { PlatformPermissionName } from "../services/platformPermissions.service.js";
import { i18n } from "../instances.js";

/**
 * Asserts that the current session must have the requested permissions.
 *
 * @example
 * assertPlatformPermissions(req.session, "VIEW");
 */
export function assertPlatformPermissions(
    session: ValidSessionType, 
    requiredPermission: PlatformPermissionName | PlatformPermissionName[]
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
