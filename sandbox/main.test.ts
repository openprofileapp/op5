import PlatformPermissionsService from "../src/backend/_common/services/platformPermissions.service.ts"

console.log(
    PlatformPermissionsService.encode(
        ["VIEW", "READ", "WRITE", "USE_INTERACTIONS"]
    )
);
