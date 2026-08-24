import { AdvancedError } from "kage-library";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import PlatformPermissionsService, { PermissionName } from "../services/platformPermissions.service.js";

export function assertPermissions(
    session: ValidSessionType, 
    requiredPermission: PermissionName | PermissionName[]
): void {
    // DEVELOPER NEEDED: Also to an assets permission check and interaction check to ensure the
    // interacting user isn't blocked or limited by the asset or owner.

    if (!PlatformPermissionsService.has(
        session.permissions.value, 
        requiredPermission
    )) {
        throw new AdvancedError({
            code: 401,
            message: "Unauthorized"
        })
    }
}
