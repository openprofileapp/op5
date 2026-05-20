/* 
————————————————————————————————————————————————————————————————
EDITING EXISTING INDEX VALUES OR REUSEING THEM WILL BREAK THE 
PERMISSIONS SERVICE AND CAUSE MAJOR DATA VULNERABILITIES
———————————————————————————————————————————————————————————————— 
*/

const index = {
    /* 
    ————————————————————————————————————————————————————————————————
    PLATFORM
    ———————————————————————————————————————————————————————————————— 
    */

    // Base
    VIEW: 0n, // View OpenProfile and authorized assets/users overview
    READ: 1n, // Read authorized assets beyond overview
    WRITE: 2n, // Allows API to accept POST requests (except login, locale, and theme updates)

    // Common
    USE_INTERACTIONS: 3n, // REQUIRES "WRITE"; Allows user to follow, like, favorite, mute, block, hide, save, etc.
    SEND_COMMENTS: 4n, // REQUIRES "WRITE"; Comment on authorized assets
    SEND_MESSAGES: 5n, // REQUIRES "WRITE"; Message authorized users
    CREATE_REPORTS: 6n, // REQUIRES "WRITE"; Create reports on assets and users
    CREATE_ASSETS: 7n, // REQUIRES "WRITE"; Create and manage owned assets completely including assigning users and deletion
    CREATE_BOTS: 8n, // REQUIRES "WRITE"; Create and manage owned bot accounts including resetting their tokens and deletion

    // Limited
    BYPASS_EXTERNAL_ADS: 9n, // External ads will not render on client
    PREMIUM_ACCESS: 10n, // REQUIRES "WRITE"; Access premium perks (auras, create custom themes, promotion, animated avatars, etc.)
    USE_CUSTOM_THEMES: 11n, // REQUIRES "PREMIUM_ACCESS"; Use custom themes
    CREATE_MEMORIES: 12n, // Create and manage posts on authorized assets that disappears after 24 hours
    VERIFIED_ACCESS: 13n, // ???
    VOUCH_USER: 14n, // REQUIRES "VERIFIED_ACCESS"; Vouch a user towards earning the trusted artist badge
    CASHOUT_REVENUE: 15n, // Cashout revenue to external app, bank, or in-app credits
    ARTIST_ACCESS: 16n, // ???
    PARTNER_ACCESS: 17n, // Access the partner stats page
    
    // Operations
    REVIEW_TICKETS: 18n, // View, sort, accept, or deny user submitted tickets
    MANAGE_SUBSCRIPTIONS: 65n, // Edit, cancel, or assign account subscriptions
    REVIEW_REPORTS: 18n, // View, sort, accept, or deny user submitted reports
    AUDIT_ACCESS: 55n, // Based on permissions, view and take action on changes performed by users
    MANAGE_VISIBILITY: 77n, // Manage visibility on assets or user profiles and request changes
    WARN_ACCOUNTS: 78n, // Warn accounts using pre-defined reasons
    SUSPEND_ACCOUNTS: 79n, // Block accounts from accessing most of the platform
    LOCK_ACCOUNTS: 80n, // Lock accounts to prevent login without further steps
    REVIEW_APPEALS: 70n, // View, sort, accept, or deny user submitted moderation appeals
    TERMINATE_SESSIONS: 81n, // Terminate active user sessions
    MANAGE_ACCESS: 56n, // View and filter external connections, emails, phone numbers, and ips
    MANAGE_AUTOMOD: 57n, // Manage blocked keyword filters and automatic actions on bypass
    MANAGE_ASSETS: 7n, // Manage assets overview including assigning users and deletion
    MANAGE_BOTS: 8n, // Manage bot accounts overview including resetting their tokens and deletion
    MANAGE_ACCOUNTS: 64n, // Manage user profle overview including editing private data
    TRANSFER_OWNERSHIP: 54n, // Transfer ownership of assets



    
    
    VIEW_ANALYTICS: 46n, // View and compare analytics of asset
    MANAGE_STAFFF: 40n,
    MANAGE_BADGES: 40n,
    // REVENUE
    // MANAGE_SUPPORT_AGENTS
    ADMIN: 57n, // COMPLETE CONTROL OF GRANTED ASSET
    SUPER_ADMIN: 58n, // Gives complete control over all assets and assign or revoke users as admin 

    /* 
    ————————————————————————————————————————————————————————————————
    COLLABORATIVE
    ———————————————————————————————————————————————————————————————— 
    */

    // Collaborative (36n-75n)
    // Seperate create from manage
     // ASSET: If combined with MANAGE_PUBLICATIONS, apply auras and animated avatars to asset (priority) // ASSET: If combined with MANAGE_PROMOTIONS, promote asset (priority)
    ASSET_VIEW: 0n, // APP: View OpenProfile and all public assets/users overview // ASSET: View asset overview (priority)
    ASSET_READ: 1n, // APP: Read all public assets beyond overview // ASSET: Read asset beyond overview (priority)
    ASSET_WRITE: 2n, // APP: Edit all values of owned assets // ASSET: Edit authorized values of asset (priority)
    ASSET_INTERACT: 3n, // APP: Use interactions (follow, like, favorite, mute, block, hide, save, etc.)
    ASSET_SEND_COMMENTS: 4n, // APP: Comment on assets with comments enabled // ASSET: Comment on asset (priority)
    ASSET_MANAGE_MEDIA: 36n, // Manage illustrations and other media of asset
    ASSET_REVIEW_CHANGES: 37n, // Accept or deny value and media edits for publishing or restore them via an auto-save or backup
    ASSET_MANAGE_FIELDS: 38n, // Manage authorized fields of asset
    ASSET_MANAGE_CATEGORIES: 39n, // Manage authorized categories of asset
    ASSET_MANAGE_COLLECTIONS: 40n, // Manage authorized collections of asset
    ASSET_MANAGE_FANFLAIRS: 41n, // Manage fanflairs of asset
    ASSET_MANAGE_COMMENTS: 42n, // Manage comments on asset (delete/restore)
    ASSET_MANAGE_INTERACTIONS: 43n, // Manage user interaction "INTERACT" access with asset by ristricting comments or blocking "VIEW" and "READ"
    ASSET_MANAGE_AUTOMOD: 44n, // Manage blocked keywords and automatic actions on asset for comments and values
    ASSET_MANAGE_PUBLICATIONS: 45n, // Manage overview of asset including badges, links, featured content, update-log, and publication state
    ASSET_VIEW_ANALYTICS: 46n, // View and compare analytics of asset
    ASSET_MANAGE_PROMOTIONS: 47n, // Manage promotions of asset using the admin set budget (CURRENTLY UNLIMITED AS PREMIUM; 2 ASSETS PER ACCOUNT)
    ASSET_MANAGE_BACKUPS: 48n, // Manage backups and auto-saves of asset (create/restore/delete)
    ASSET_UPDATE_URL: 49n, // Update custom URL of asset (projects only)
    ASSET_MANAGE_AUTHORS: 50n, // Assign or revoke users as authors and manage which fields they can write // GRANTABLE PERMISSIONS: "WRITE"
    ASSET_MANAGE_ILLUSTRATORS: 51n, // Assign or revoke users as illustrators // GRANTABLE PERMISSIONS: "MANAGE_MEDIA"
    ASSET_MANAGE_EDITORS: 52n, // Assign or revoke users as editors and manage which categories they can edit or manage // GRANTABLE PERMISSIONS: "REVIEW_CHANGES", "MANAGE_FIELDS", "MANAGE_CATEGORIES"
    ASSET_MANAGE_CURATORS: 53n, // Assign or revoke users as curators and manage which collections they can manage // GRANTABLE PERMISSIONS: "MANAGE_MEMORIES", "MANAGE_COLLECTIONS"
    ASSET_MANAGE_MODERATORS: 54n, // Assign or revoke users as moderators and manage which assets they can moderate // GRANTABLE PERMISSIONS: "MANAGE_COMMENTS", "MANAGE_INTERACTIONS", "MANAGE_AUTOMOD", "AUDIT_ACCESS"
    ASSET_AUDIT_ACCESS: 55n, // Based on permissions, view and rollback any changes on asset performed by users
    ASSET_VIEW_REVENUE: 56n, // View monetized revenue
    ASSET_ADMIN: 57n, // COMPLETE CONTROL OF GRANTED ASSET
    ASSET_SUPER_ADMIN: 58n, // Gives complete control over all assets and assign or revoke users as admin 
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
            "CASHOUT_REVENUE", "PARTNER_ACCESS"
        ]
    },
    supportAgent: {
        name: "Support Agent",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "REVIEW_TICKETS", "MANAGE_SUBSCRIPTIONS"
        ]
    },
    moderator: {
        name: "Moderator",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "REVIEW_REPORTS", "AUDIT_ACCESS", "MANAGE_VISIBILITY", "WARN_ACCOUNTS", "SUSPEND_ACCOUNTS"
        ]
    },
    seniorModerator: {
        name: "Senior Moderator",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "REVIEW_REPORTS", "AUDIT_ACCESS", "MANAGE_VISIBILITY", "WARN_ACCOUNTS", "SUSPEND_ACCOUNTS",
            "LOCK_ACCOUNTS", "REVIEW_APPEALS"
        ]
    },
    admin: {
        name: "Administrator",
        permissions: [
            "VIEW", "READ", "WRITE", 
            "USE_INTERACTIONS", "SEND_COMMENTS", "SEND_MESSAGES", 
            "CREATE_REPORTS", "CREATE_ASSETS", "CREATE_BOTS",
            "REVIEW_TICKETS", "MANAGE_SUBSCRIPTIONS",
            "REVIEW_REPORTS", "AUDIT_ACCESS", "MANAGE_VISIBILITY", "WARN_ACCOUNTS", "SUSPEND_ACCOUNTS",
            "LOCK_ACCOUNTS", "REVIEW_APPEALS",
            "TERMINATE_SESSIONS", "MANAGE_ACCESS", "MANAGE_AUTOMOD",
            "MANAGE_ASSETS", "MANAGE_BOTS", "MANAGE_ACCOUNTS", "TRANSFER_OWNERSHIP"
        ]
    }

    // Collaborative
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
