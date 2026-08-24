/* 
————————————————————————————————————————————————————————————————
EDITING EXISTING INDEX VALUES OR REUSEING THEM WILL BREAK THE 
PERMISSIONS SERVICE AND CAUSE MAJOR DATA VULNERABILITIES
———————————————————————————————————————————————————————————————— 
*/

import { AdvancedError } from "kage-library";

const index = {
    VIEW: 0n, // View user profiles and asset overviews
    READ: 1n, // Read assets beyond overview
    WRITE: 2n, // Edit your user profile

    USE_INTERACTIONS: 3n, // Follow/like/save/hide/mute/block users and assets etc.
    USE_SOCIAL_FEATURES: 4n, // Send comments and messages, and send/receive friend requests
    
    CREATE_REPORTS: 5n, // Create reports on assets and users
    CREATE_ASSETS: 6n, // Create and manage owned assets
    CREATE_BOTS: 7n, // Create and manage owned bots

    PREMIUM_ACCESS: 8n, // Access premium perks (auras, custom themes, animated avatars, etc.)
    BYPASS_EXTERNAL_ADS: 9n, // Do not display external ads to the user
    USE_CUSTOM_THEMES: 10n, // Use custom themes

    VERIFIED_ACCESS: 11n, // ???
    CREATE_MEMORIES: 12n, // Create and manage posts on owned assets that disappears after 24 hours
    EARN_REVENUE: 13n, // Earn revenue from ads or other means
    CASHOUT_REVENUE: 14n, // Cashout revenue to external app, bank, or in-app credits

    PARTNER_ACCESS: 15n, // Access the partner stats page and other tools
    TOGGLE_EXPERIMENTS: 16n, // View and toggle on-going experiments instead of being randomly rolled

    VIEW_ANALYTICS: 17n, // View and compare platform analytics (minus revenue) aganist its own data
    VIEW_REVENUE: 18n,// View and compare the platform revenue earned aganist its own data
    AUDIT_ACCESS: 19n, // Based on permissions, view and take action on changes performed

    REVIEW_TICKETS: 20n, // View, sort, accept, or deny support tickets
    MANAGE_SUBSCRIPTIONS: 21n, // Edit, cancel, or assign account subscriptions
    TERMINATE_SESSIONS: 23n, // Terminate active user sessions

    REVIEW_REPORTS: 24n, // View, sort, accept, or deny reports
    REVIEW_APPEALS: 25n, // View, sort, accept, or deny moderation appeals
    MANAGE_VISIBILITY: 26n, // Manage visibility of assets or user profiles, including badges
    REQUEST_CHANGES: 27n, // Request changes on assets or user profiles
    WARN_ACCOUNTS: 28n, // Warn accounts using pre-defined reasons
    SUSPEND_ACCOUNTS: 29n, // Block accounts from interacting with the platform (they can still view and download assets)
    
    MANAGE_ACCESS: 30n, // View and filter external link, emails, phone numbers, and ips
    MANAGE_AUTOMOD: 31n, // Manage blocked keyword filters and automatic actions on bypass
    MANAGE_ASSETS: 32n, // Manage all published assets, including modifying overview
    MANAGE_BOTS: 33n, // Manage all bots, including resetting token
    MANAGE_ACCOUNTS: 34n, // Manage all accounts, including modifying overview

    TRANSFER_OWNERSHIP: 35n, // Transfer ownership of assets
    VERIFY_ACCOUNT: 36n, // Verify user accounts as official
    PROMOTE_ASSET: 37n, // Promote assets to be more visible across the platform
    
    MANAGE_STAFF: 38n, // Assign or revoke the following permissions: "VIEW_ANALYTICS", "AUDIT_ACCESS"
    MANAGE_PARTNERS: 39n, // Assign or revoke the following permissions: "PARTNER_ACCESS", "TOGGLE_EXPERIMENTS"
    MANAGE_SUPPORT_AGENTS: 40n, // Assign or revoke the following permissions: "REVIEW_TICKETS", "MANAGE_SUBSCRIPTIONS", "MANAGE_VISIBILITY"
    MANAGE_MODERATORS: 41n, // Assign or revoke the following permissions: "REVIEW_REPORTS", "MANAGE_VISIBILITY", "REQUEST_CHANGES", "WARN_ACCOUNTS", "SUSPEND_ACCOUNTS", "REVIEW_APPEALS", "TERMINATE_SESSIONS"
    
    ADMIN: 42n, // Grants all current and future permissions; complete control over the platform, but can't assign or revoke the following permissions: "ADMIN"
    SUPER_ADMIN: 43n, // Grants all current and future permissions; complete control over the platform and can assign or revoke the following permissions: "ADMIN" 
} as const;























//A.L.I.C.E = "Advanced Language Interactive Content Editor"; idk lol

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

export type PermissionName = keyof typeof index;
type RoleName = keyof typeof roles;

interface RoleResult {
    name: string;
    value: string;
    array: PermissionName[];
}


const requiredPermission = interactionPermissions[type as InteractionNameType];

/**
 * Handles encoding, decoding, checking, and updating permission bitmasks.
 * Permissions are stored as bigint bit flags based on a central index map.
 */
export default class PlatformPermissionsService {
    public static permissions = index;

    private static bit(permission: PermissionName): bigint {
        if (!(permission in this.permissions)) {
            throw new AdvancedError({
                code: 404,
                message: `Permission "${permission}" not found`
            })
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
            throw new AdvancedError({
                code: 400,
                message: "Malformed request"
            })
        }

        if (!/^[0-9]+$/.test(input)) {
            throw new AdvancedError({
                code: 400,
                message: "Malformed request"
            })
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
            throw new AdvancedError({
                code: 400,
                message: "Malformed request"
            })
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
            throw new AdvancedError({
                code: 404,
                message: `Role "${input}" not found`
            })
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
