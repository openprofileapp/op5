/* 
————————————————————————————————————————————————————————————————
EDITING EXISTING INDEX VALUES OR REUSEING THEM WILL BREAK THE 
PERMISSIONS SERVICE AND CAUSE MAJOR DATA VULNERABILITIES
———————————————————————————————————————————————————————————————— 
*/

const index = {
    VIEW: 0n, // View asset overview
    READ: 1n, // Read asset beyond overview
    WRITE: 2n, // Edit authorized values of asset
    INTERACT: 3n, // Use interactions (follow, like, favorite, mute, block, hide, save, etc.)
    SEND_COMMENTS: 4n, // Comment on asset
    MANAGE_MEDIA: 36n, // Manage illustrations and other media of asset
    REVIEW_CHANGES: 37n, // Accept or deny value and media edits for publishing or restore them via an auto-save or backup
    MANAGE_FIELDS: 38n, // Manage authorized fields of asset
    MANAGE_CATEGORIES: 39n, // Manage authorized categories of asset
    MANAGE_COLLECTIONS: 40n, // Manage authorized collections of asset
    MANAGE_FANFLAIRS: 41n, // Manage fanflairs of asset
    MANAGE_COMMENTS: 42n, // Manage comments on asset (delete/restore)
    MANAGE_INTERACTIONS: 43n, // Manage user interaction "INTERACT" access with asset by ristricting comments or blocking "VIEW" and "READ"
    MANAGE_AUTOMOD: 44n, // Manage blocked keywords and automatic actions on asset for comments and values
    MANAGE_PUBLICATIONS: 45n, // Manage overview of asset including badges, links, featured content, update-log, and publication state // If combined with MANAGE_PUBLICATIONS, apply auras and animated avatars to asset // ASSET: If combined with MANAGE_PROMOTIONS, promote asset
    VIEW_ANALYTICS: 46n, // View and compare analytics of asset
    MANAGE_PROMOTIONS: 47n, // Manage promotions of asset using the admin set budget (CURRENTLY UNLIMITED AS PREMIUM; 2 ASSETS PER ACCOUNT)
    MANAGE_BACKUPS: 48n, // Manage backups and auto-saves of asset (create/restore/delete)
    UPDATE_URL: 49n, // Update custom URL of asset (projects only)
    MANAGE_AUTHORS: 50n, // Assign or revoke users as authors and manage which fields they can write // GRANTABLE PERMISSIONS: "WRITE"
    MANAGE_ILLUSTRATORS: 51n, // Assign or revoke users as illustrators // GRANTABLE PERMISSIONS: "MANAGE_MEDIA"
    MANAGE_EDITORS: 52n, // Assign or revoke users as editors and manage which categories they can edit or manage // GRANTABLE PERMISSIONS: "REVIEW_CHANGES", "MANAGE_FIELDS", "MANAGE_CATEGORIES"
    MANAGE_CURATORS: 53n, // Assign or revoke users as curators and manage which collections they can manage // GRANTABLE PERMISSIONS: "MANAGE_MEMORIES", "MANAGE_COLLECTIONS"
    MANAGE_MODERATORS: 54n, // Assign or revoke users as moderators and manage which assets they can moderate // GRANTABLE PERMISSIONS: "MANAGE_COMMENTS", "MANAGE_INTERACTIONS", "MANAGE_AUTOMOD", "AUDIT_ACCESS"
    AUDIT_ACCESS: 55n, // Based on permissions, view and rollback any changes on asset performed by users
    VIEW_REVENUE: 56n, // View monetized revenue
    ADMIN: 57n, // COMPLETE CONTROL OF GRANTED ASSET
    SUPER_ADMIN: 58n, // Gives complete control over all assets and assign or revoke users as admin 
} as const;

// Move this to a database if custom roles release
const roles = {
    // Platform
    robot: { name: "Robot", permissions: ["VIEW"] },
    guest: { name: "Guest", permissions: ["VIEW","READ"] },
    member: {
        name: "Member",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS"
        ]
    },
    premium: {
        name: "Premium",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "BYPASS_EXTERNAL_ADS", "PREMIUM_ACCESS", "USE_CUSTOM_THEMES"
        ]
    },
    verified: {
        name: "Verified",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "CREATE_MEMORIES", "VERIFIED_ACCESS", "VOUCH_USER"
        ]
    },
    partner: {
        name: "Partner",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "BYPASS_EXTERNAL_ADS", "PREMIUM_ACCESS", "USE_CUSTOM_THEMES",
            "CASHOUT_REVENUE", "PARTNER_ACCESS", "VOUCH_USER"
        ]
    },
    staff: {
        name: "Staff",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "BYPASS_EXTERNAL_ADS", "PREMIUM_ACCESS", "USE_CUSTOM_THEMES",
        ]
    },
    supportAgent: {
        name: "Support Agent",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "REVIEW_TICKETS", "MANAGE_SUBSCRIPTIONS", "MANAGE_VISIBILITY"
        ]
    },
    moderator: {
        name: "Moderator",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "REVIEW_REPORTS", "AUDIT_ACCESS", "MANAGE_VISIBILITY", "REQUEST_CHANGES", "WARN_ACCOUNTS", "SUSPEND_ACCOUNTS", "TERMINATE_SESSIONS"
        ]
    },
    seniorModerator: {
        name: "Senior Moderator",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "REVIEW_REPORTS", "AUDIT_ACCESS", "MANAGE_VISIBILITY", "REQUEST_CHANGES", "WARN_ACCOUNTS", "SUSPEND_ACCOUNTS",
            "LOCK_ACCOUNTS", "REVIEW_APPEALS"
        ]
    },
    admin: {
        name: "Administrator",
        permissions: [
            "ADMIN"
        ]
    }
} satisfies Record<string, Role>;

interface Role {
    name: string;
    permissions: PermissionName[];
}

type PermissionName = keyof typeof index;
type RoleName = keyof typeof roles;

interface RoleResult {
    name: string;
    value: string;
    array: PermissionName[];
}

/**
 * Handles encoding, decoding, checking, and updating permission bitmasks.
 * Permissions are stored as bigint bit flags based on a central index map.
 */
export default class AssetPermissionsService {
    public static permissions = index;

    private static bit(permission: PermissionName): bigint {
        if (!(permission in this.permissions)) {
            // Throw AdvancedError
            throw Object.assign(
                new Error(`Permission "${permission}" not found`),
                { code: 404 }
            );
        }

        return 1n << this.permissions[permission];
    }

    /**
     * Decodes a bigint string into an array of permission names.
     *
     * @example
     * PermissionsService.decode("1"); // ["VIEW"]
     */
    public static decode(input: string): PermissionName[] {
        if (!input) {
            // Throw AdvancedError
            throw Object.assign(new Error("Invalid input"), {
                code: 400,
            });
        }

        if (!/^[0-9]+$/.test(input)) {
            throw Object.assign(new Error("Invalid permissions"), {
                code: 400,
            });
        }

        const userPermissions = BigInt(input);
        const result: PermissionName[] = [];

        if ((userPermissions & this.bit("SUPER_ADMIN")) !== 0n) {
            return Object.keys(this.permissions) as PermissionName[];
        }

        if ((userPermissions & this.bit("ADMIN")) !== 0n) {
            return Object.keys(this.permissions).filter(
                (p) => p !== "SUPER_ADMIN"
            ) as PermissionName[];
        }

        for (const [name, shift] of Object.entries(this.permissions)) {
            if ((userPermissions & (1n << shift)) !== 0n) {
                result.push(name as PermissionName);
            }
        }

        return result;
    }

    /**
     * Encodes a list of permissions into a bigint string.
     *
     * @example
     * PermissionsService.encode(["VIEW", "READ"]); // "3"
     */
    public static encode(input: PermissionName[]): string {
        if (!input?.length) {
            // Throw AdvancedError
            throw Object.assign(new Error("Invalid input"), {
                code: 400,
            });
        }

        let result = 0n;

        for (const permission of input) {
            result |= this.bit(permission);
        }

        return result.toString();
    }

    /**
     * Checks whether a permission set satisfies required permissions.
     *
     * @example
     * PermissionsService.can("1", ["VIEW"]);
     */
    public static can(
        input: string,
        compare: PermissionName | PermissionName[]
    ): boolean {
        const decoded = this.decode(input);

        const permissions = Array.isArray(compare)
            ? compare
            : [compare];

        if (decoded.includes("SUPER_ADMIN")) {
            return true;
        }

        if (decoded.includes("ADMIN")) {
            return !permissions.includes("SUPER_ADMIN");
        }

        return permissions.every((permission) =>
            decoded.includes(permission)
        );
    }

    /**
     * Resolves a role into its encoded permission value and list.
     *
     * @example
     * PermissionsService.getRole("robot");
     * {
     *     name: "Robot",
     *     value: "1",
     *     array: ["VIEW"]
     * }
     */
    public static getRole(input: RoleName): RoleResult {
        const role = roles[input];

        if (!role) {
            throw Object.assign(
                new Error(`Role "${input}" not found`),
                { code: 404 }
            );
        }

        return {
            name: role.name,
            value: this.encode(role.permissions),
            array: role.permissions,
        };
    }

    /**
     * Adds or removes permissions from an existing permission bitmask.
     *
     * @example
     * PermissionsService.update("1", "READ", true);
     * PermissionsService.update("3", ["VIEW", "READ"], false);
     */
    public static update(
        input: string | bigint,
        permission: PermissionName | PermissionName[],
        add = true
    ): string {
        let permValue = BigInt(input);

        const permissions = Array.isArray(permission)
            ? permission
            : [permission];

        for (const perm of permissions) {
            const bitValue = this.bit(perm);

            if (add) {
                permValue |= bitValue;
            } else {
                permValue &= ~bitValue;
            }
        }

        return permValue.toString();
    }
}
