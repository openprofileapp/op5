/* 
————————————————————————————————————————————————————————————————
EDITING EXISTING INDEX VALUES OR REUSEING THEM WILL BREAK THE 
PERMISSIONS SERVICE AND CAUSE MAJOR DATA VULNERABILITIES
———————————————————————————————————————————————————————————————— 
*/

const index = {
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
    CREATE_MEMORIES: 12n, // REQUIRES "WRITE"; Create and manage posts on authorized assets that disappears after 24 hours
    VERIFIED_ACCESS: 13n, // ???
    EMPTY_PERMISSION: 14n, // ??? PREVIOUS VOUCH_USER
    EARN_REVENUE: 15n, // Earn revenue from ads or other means
    CASHOUT_REVENUE: 15n, // Cashout revenue to external app, bank, or in-app credits
    ARTIST_ACCESS: 16n, // ???
    PARTNER_ACCESS: 17n, // Access the partner stats page
    
    // Operations
    VIEW_ANALYTICS: 46n, // View and compare platform analytics (minus revenue) aganist its own data
    VIEW_REVENUE: 46n,// REQUIRES "VIEW_ANALYTICS"; View and compare the platform revenue earned aganist its own data
    AUDIT_ACCESS: 55n, // Based on permissions, view and take action on changes performed by users
    REVIEW_TICKETS: 18n, // REQUIRES "WRITE"; View, sort, accept, or deny user submitted tickets
    MANAGE_SUBSCRIPTIONS: 65n, // REQUIRES "WRITE"; Edit, cancel, or assign account subscriptions
    REVIEW_REPORTS: 18n, // REQUIRES "WRITE"; View, sort, accept, or deny user submitted reports
    MANAGE_VISIBILITY: 77n, // REQUIRES "WRITE"; Manage visibility on assets or user profiles incluing badges
    REQUEST_CHANGES: 77n, // REQUIRES "WRITE"; Request changes on assets or user profiles
    WARN_ACCOUNTS: 78n, // REQUIRES "WRITE"; Warn accounts using pre-defined reasons
    SUSPEND_ACCOUNTS: 79n, // REQUIRES "WRITE"; Block accounts from accessing most of the platform
    LOCK_ACCOUNTS: 80n, // REQUIRES "WRITE"; Lock accounts to prevent login without further steps
    REVIEW_APPEALS: 70n, // REQUIRES "WRITE"; View, sort, accept, or deny user submitted moderation appeals
    TERMINATE_SESSIONS: 81n, // REQUIRES "WRITE"; Terminate active user sessions
    MANAGE_ACCESS: 56n, // REQUIRES "WRITE"; View and filter external connections, emails, phone numbers, and ips
    MANAGE_AUTOMOD: 57n, // REQUIRES "WRITE"; Manage blocked keyword filters and automatic actions on bypass
    MANAGE_ASSETS: 7n, // REQUIRES "WRITE"; Manage assets overview including assigning users and deletion
    MANAGE_BOTS: 8n, // REQUIRES "WRITE"; Manage bot accounts overview including resetting their tokens and deletion
    MANAGE_ACCOUNTS: 64n, // REQUIRES "WRITE"; Manage user profle overview including editing private data
    TRANSFER_OWNERSHIP: 54n, // REQUIRES "WRITE"; Transfer ownership of assets
    VERIFY_ACCOUNT: 40n, // REQUIRES "WRITE"; Verify user accounts as official
    PROMOTE_ASSET: 40n, // REQUIRES "WRITE"; Promote assets to be more visible across the platform
    MANAGE_STAFF: 40n, // REQUIRES "WRITE"; Assign or revoke the following permissions: "VIEW_ANALYTICS", "AUDIT_ACCESS"
    MANAGE_PARTNERS: 40n, // REQUIRES "WRITE"; Assign or revoke the following permissions: "PARTNER_ACCESS"
    MANAGE_SUPPORT_AGENTS: 40n, // REQUIRES "WRITE"; Assign or revoke the following permissions: "REVIEW_TICKETS", "MANAGE_SUBSCRIPTIONS", "MANAGE_VISIBILITY"
    MANAGE_MODERATORS: 40n, // REQUIRES "WRITE"; Assign or revoke the following permissions: "REVIEW_REPORTS", "MANAGE_VISIBILITY", "REQUEST_CHANGES", "WARN_ACCOUNTS", "SUSPEND_ACCOUNTS", "LOCK_ACCOUNTS", "REVIEW_APPEALS", "TERMINATE_SESSIONS"
    ADMIN: 57n, // Grants all current and future permissions; complete control over the platform, but can't assign or revoke the following permissions: "ADMIN"
    SUPER_ADMIN: 58n, // Grants all current and future permissions; complete control over the platform and can assign or revoke the following permissions: "ADMIN" 
} as const;

// Move this to a database if custom roles release
const roles = {
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
            "CREATE_MEMORIES", "VERIFIED_ACCESS"
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
export default class PlatformPermissionsService {
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
     * Checks whether a permission value satisfies required permissions array.
     *
     * @example
     * PermissionsService.has("1", ["VIEW", "READ"]); // all (default)
     * PermissionsService.has("1", ["VIEW", "READ"], "any");
     */
    public static has(
        input: string,
        compare: PermissionName | PermissionName[],
        mode: "all" | "any" = "all"
    ): boolean {
        const decoded = this.decode(input);

        const permissions = Array.isArray(compare)
            ? compare
            : [compare];

        if (decoded.includes("SUPER_ADMIN")) {
            return true;
        }

        return mode === "all"
            ? permissions.every(permission => decoded.includes(permission))
            : permissions.some(permission => decoded.includes(permission));
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
