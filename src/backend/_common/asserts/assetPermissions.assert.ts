import { AdvancedError } from "kage-library";
import AssetPermissionsService, { AssetPermissionName } from "../../api/services/assetPermissions.service.js";
import { i18n } from "../instances.js";

/**
 * Asserts that the current session must have the requested permissions.
 *
 * @example
 * assertPlatformPermissions(req.session, "VIEW");
 */
export function assertAssetPermissions(
    userId: string, 
    requiredPermission: AssetPermissionName | AssetPermissionName[],
    assetId: string
): void {
    if (!AssetPermissionsService.can(
        userId, 
        requiredPermission,
        assetId
    )) {
        throw new AdvancedError({
            code: 401,
            message: i18n.t("responses.unauthorized")
        })
    }
}
