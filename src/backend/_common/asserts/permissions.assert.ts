import { AdvancedError } from "kage-library";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import PlatformPermissionsService, { PermissionName } from "../services/platformPermissions.service.js";
import AssetPermissionsService from "../services/assetPermissions.service.js";

/**
 * Asserts that the current session must have the requested permissions.
 *
 * @example
 * assertPermissions(req.session, "VIEW");
 */
export function assertPermissions(
    session: ValidSessionType, 
    requiredPermission: PermissionName | PermissionName[],
    assetId?: string // MAYBE SEPARATE THEM "assertPlatformPermissions" and "assertAssetPermissions" 
): void {
    // DEVELOPER NEEDED: Also to an assets permission check and interaction check to ensure the
    // interacting user isn't blocked or limited by the asset or owner.

    // CHECK THE SESSION AGANIST THE REQUIRED PERMISSION ON THE ASSET
    /*AssetPermissionsService.can(
        session.permissions.value, 
        requiredPermission,
        assetId
    )*/

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
