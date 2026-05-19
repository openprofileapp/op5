/* 
————————————————————————————————————————————————————————————————
EDITING EXISTING INDEX VALUES OR REUSEING THEM WILL BREAK THE 
PERMISSIONS SERVICE AND CAUSE MAJOR DATA VULNERABILITIES
———————————————————————————————————————————————————————————————— 
*/

const index = {
    // General
    VIEW: 0n, // APP: View OpenProfile and all public assets/users overview // ASSET: View asset overview (priority)
    READ: 1n, // APP: Read all public assets beyond overview // ASSET: Read asset beyond overview (priority)
    WRITE: 2n, // APP: Edit all values of owned assets // ASSET: Edit authorized values of asset (priority)
    INTERACT: 3n, // APP: Use interactions (follow, like, favorite, mute, block, hide, save, etc.)
    SEND_COMMENTS: 4n, // APP: Comment on assets with comments enabled // ASSET: Comment on asset (priority)
    SEND_MESSAGES: 5n, // APP: Message users with messages enabled
    CREATE_REPORTS: 6n, // APP: Create reports on assets/users
    MANAGE_ASSETS: 7n, // Manage assets and user profile completely including assigning users and deletion
    MANAGE_BOTS: 8n,
    DEVELOP_THEMES: 9n,

    // Special
    PREMIUM_ACCESS: 10n, // APP: Access premium perks (no ads, custom themes, auras, promotion, animated avatars, etc.) // ASSET: If combined with MANAGE_PUBLICATIONS, apply auras and animated avatars to asset (priority) // ASSET: If combined with MANAGE_PROMOTIONS, promote asset (priority)
    VOUCH_USER: 11n, // Vouch a user towards trusted artist
    VERIFIED_ACCESS: 12n, // APP: ???
    ARTIST_ACCESS: 13n, // APP: ???
    PARTNER_ACCESS: 14n, // APP: Access the partner stats page

    // Collaborative
    MANAGE_MEDIA: 15n, // Manage illustrations and other media of asset
    REVIEW_CHANGES: 16n, // Accept or deny value and media edits for publishing or restore them via an auto-save or backup
    MANAGE_FIELDS: 17n, // Manage authorized fields of asset
    MANAGE_CATEGORIES: 18n, // Manage authorized categories of asset
    MANAGE_COLLECTIONS: 19n, // Manage authorized collections of asset
    MANAGE_FANFLAIRS: 20n, // Manage fanflairs of asset
    MANAGE_COMMENTS: 21n, // Manage comments on asset (delete/restore)
    MANAGE_INTERACTIONS: 22n, // Manage user interaction "INTERACT" access with asset by ristricting comments or blocking "VIEW" and "READ"
    MANAGE_AUTOMOD: 23n, // Manage blocked keywords and automatic actions on asset for comments and values
    MANAGE_PUBLICATIONS: 24n, // Manage overview of asset including badges, links, featured content, and publication state
    VIEW_ANALYTICS: 25n, // View and compare analytics of asset
    MANAGE_PROMOTIONS: 26n, // Manage promotions of asset using the admin set budget (CURRENTLY UNLIMITED AS PREMIUM; 2 ASSETS PER ACCOUNT)
    MANAGE_BACKUPS: 27n, // Manage backups and auto-saves of asset (create/restore/delete)
    UPDATE_URL: 28n, // Update custom URL of asset (projects only)
    MANAGE_AUTHORS: 29n, // Assign or revoke users as authors and manage which fields they can write // GRANTABLE PERMISSIONS: "WRITE"
    MANAGE_ILLUSTRATORS: 30n, // Assign or revoke users as illustrators // GRANTABLE PERMISSIONS: "MANAGE_MEDIA"
    MANAGE_EDITORS: 31n, // Assign or revoke users as editors and manage which categories they can edit or manage // GRANTABLE PERMISSIONS: "REVIEW_CHANGES", "MANAGE_FIELDS", "MANAGE_CATEGORIES"
    MANAGE_CURATORS: 32n, // Assign or revoke users as curators and manage which collections they can manage // GRANTABLE PERMISSIONS: "MANAGE_COLLECTIONS"
    MANAGE_MODERATORS: 33n, // Assign or revoke users as moderators and manage which assets they can moderate // GRANTABLE PERMISSIONS: "MANAGE_COMMENTS", "MANAGE_INTERACTIONS", "MANAGE_AUTOMOD", "AUDIT_ACCESS"
    MANAGE_ADMINS: 34n, // Assign or revoke users as admin and manage which assets they can control // COMPLETE CONTROL OF GRANTED ASSET
    AUDIT_ACCESS: 35n, // Based on permissions, view and rollback any changes on asset performed by users
    SUPER_ADMIN: 36n, // Assign or revoke users as super admin for complete control over all assets

    // Operations
} as const;

// FINISH THIS
/*
DELETE_ASSETS: 51n, // PLATFORM ONLY: Delete an existing asset (bypassing the permissions requirement)
RESTORE_ASSETS: 52n, // PLATFORM ONLY: Retore a deleted asset (bypassing the permissions requirement)
MANAGE_STORIES: 35n, // Create new temporary videos or posts within a multiverse, universe, or world, edit them, and delete existing ones
TRANSFER_OWNERSHIP: 54n, // PLATFORM ONLY: Transfer ownership of an existing asset (bypassing the permissions requirement)
TERMINATE_SESSIONS: 25n, // PLATFORM ONLY: Terminate active user sessions
VIEW_REPORTS: 26n, // PLATFORM ONLY: View user submitted reports
CLOSE_REPORTS: 27n, // PLATFORM ONLY: Close user submitted reports
WARN_USERS: 28n, // PLATFORM ONLY: Warn a user
SUSPEND_USERS: 29n, // PLATFORM ONLY: Suspend a user from accessing most of the app
BAN_USERS: 30n, // PLATFORM ONLY: Ban a user account
VIEW_REVENUE: 46n, // View monetized revenue
CASHOUT_REVENUE: 47n, // Cashout the monetized revenue into an external wallet, bank, or as application credits
MANAGE_VISIBILITY: 53n, // PLATFORM ONLY: Show or hide an existing asset or account and request an edit by the user, then verifiy the edit
ADMIN: 55n, // All permissions except deleting assets and transfering ownership (reserved to owner)
VIEW_ADDRESSES: 56n, // PLATFORM ONLY: View user emails and IPs information
BLACKLIST_GLOBAL_KEYWORDS: 57n, // PLATFORM ONLY: Blacklist global keywords from being used on the application
WHITELIST_GLOBAL_KEYWORDS: 58n, // PLATFORM ONLY: Whitelist blacklisted global keywords from being used on the application
BLACKLIST_OVERVIEW_KEYWORDS: 59n, // PLATFORM ONLY: Blacklist overview keywords from being used on assets
WHITELIST_OVERVIEW_KEYWORDS: 60n, // PLATFORM ONLY: Whitelist blacklisted overview keywords from being used on assets
BLACKLIST_ADDRESSES: 61n, // PLATFORM ONLY: Blacklist emails and IPs from accessing the application
WHITELIST_ADDRESSES: 62n, // PLATFORM ONLY: Whitelist blacklisted emails and IPs from accessing the application
LOCK_ACCOUNTS: 63n, // PLATFORM ONLY: Lock accounts to prevent user access
MANAGE_ACCOUNTS: 64n, // PLATFORM ONLY: Edit and reset public/private account information
MANAGE_SUBSCRIPTIONS: 65n, // PLATFORM ONLY: Edit or stop existing paid and trial subscriptions
*/

// Move this to a database if custom roles release
const roles = {
    // General
    robot: {
        name: "Robot",
        permissions: [
            "VIEW"
        ]
    },
    guest: {
        name: "Guest",
        permissions: [
            "VIEW",
            "READ"
        ]
    },
    member: {
        name: "Member",
        permissions: [
            "VIEW",
            "READ",
            "WRITE",
            "INTERACT",
            "SEND_COMMENTS",
            "SEND_MESSAGES",
            "CREATE_REPORTS",
            "MANAGE_ASSETS",
            "MANAGE_BOTS",
            "DEVELOP_THEMES"
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
 * PermissionsService
 *
 * Handles encoding, decoding, checking, and updating permission bitmasks.
 * Permissions are stored as bigint bit flags based on a central index map.
 */
export default class PermissionsService {
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
