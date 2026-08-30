/* 
————————————————————————————————————————————————————————————————
EDITING EXISTING INDEX VALUES OR REUSEING THEM WILL BREAK THE 
PERMISSIONS SERVICE AND CAUSE MAJOR DATA VULNERABILITIES
———————————————————————————————————————————————————————————————— 
*/

import { AdvancedError } from "kage-library";
import whatIs from "../helpers/whatIs.js";
import { GetPublishedCharacterType } from "../../../_common/types/character.type.js";
import { GetUserType } from "../../../_common/types/user.type.js";
import getPublishedCharactersService from "./getPublishedCharacters.service.js";
import { db } from "../databases/db.js";
import { PermissionsType } from "../../../_common/types/permissions.type.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import getUsersService from "./getUsers.service.js";

const index = {
    VIEW: 0n, // View asset overview
    READ: 1n, // Read asset beyond overview
    WRITE: 2n, // Edit authorized values

    FEATURE_AS_COLLAB: 3n, // Display asset in collaborator's collaborations profile tab, and display collaborator on the asset's collaboration list 
    FEATURE_AS_OWNER: 4n, // Display asset in collaborator's owned profile tab
    
    SEND_COMMENTS: 5n, // Send comments
    ADD_NOTES: 6n, // Add new field notes

    MANAGE_NOTES: 7n, // Add new or edit existing field notes
    MANAGE_MEDIA: 8n, // Upload and manage illustrations and media
    MANAGE_FANFLAIRS: 9n, // Create and manage fanflairs
    MANAGE_MEMORIES: 10n, // Upload and manage posts that disappears after a specific interval (max 24 hours)
    MANAGE_COLLECTIONS: 11n, // Create and manage authorized collections
    MANAGE_TEMPLATES: 12n, // Create and manage authorized templates

    VIEW_ANALYTICS: 13n, // View and compare analytics (minus revenue) aganist its own data
    VIEW_REVENUE: 14n,// View and compare monetized revenue earned aganist its own data
    AUDIT_ACCESS: 15n, // Based on permissions, view and rollback any changes performed

    MANAGE_COMMENTS: 16n, // Manage comments and restrict users from being able to further comment
    MANAGE_ACCESS: 17n, // Manage user access by blocking "VIEW" and "READ"
    MANAGE_AUTOMOD: 18n, // Manage blocked keyword filters and automatic actions on bypass for comments and values

    REVIEW_CHANGES: 19n, // Accept or deny value and media edits for publishing, and restore them from an auto-save or backup    
    MANAGE_PUBLICATIONS: 20n, // Manage overview including badges, links, pins, update-log, and publication state; if the user is premium, they can also apply auras and set animated avatars
    MANAGE_PROMOTIONS: 21n, // Manage promotions using the admin set budget
    MANAGE_BACKUPS: 22n, // Manage backups and auto-saves of asset (cannot delete auto-saves for data-loss prevention reasons)
  
    MANAGE_MODERATORS: 23n, // Assign or revoke the following permissions: "AUDIT_ACCESS", "MANAGE_COMMENTS", "MANAGE_ACCESS", "MANAGE_AUTOMOD"
  
    ADMIN: 24n, // Grants all current and future permissions (except "FEATURE_AS_OWNER", must be manually toggled); complete control over the asset, but can't assign or revoke the following permissions: "ADMIN"
} as const;

const roles = {
    betaReader: { 
        name: "Beta Reader",
        description: "Provides early feedback and suggestions on unpublished drafts.",
        permissions: [
            "VIEW", "READ",
            "FEATURE_AS_COLLAB",
            "ADD_NOTES"
        ]
    },
    author: { 
        name: "Author",
        description: "Writer responsible for filling-in values on authorized fields.",
        permissions: [
            "VIEW", "READ", "WRITE",
            "FEATURE_AS_COLLAB",
            "ADD_NOTES",
        ]
    },
    illustrator: { 
        name: "Illustrator",
        description: "Visual artist responsible for uploading artworks and creating fan flairs.",
        permissions: [
            "VIEW", "READ",
            "FEATURE_AS_COLLAB",
            "MANAGE_MEDIA", "MANAGE_FANFLAIRS"
        ]
    },
    curator: { 
        name: "Curator",
        description: "Organizes assets into structured collections and posts external content featuring said asset.",
        permissions: [
            "VIEW", "READ",
            "MANAGE_MEMORIES", "MANAGE_COLLECTIONS"
        ]
    },
    editor: { 
        name: "Editor",
        description: "Creates and updates the template, proofreads changes, manages uploads, and approves content quality.",
        permissions: [
            "VIEW", "READ", "WRITE",
            "FEATURE_AS_COLLAB",
            "MANAGE_NOTES", "MANAGE_MEDIA", "MANAGE_FANFLAIRS", "MANAGE_TEMPLATES",
            "AUDIT_ACCESS",
            "REVIEW_CHANGES"
        ]
    },
    publisher: { 
        name: "Publisher",
        description: "Publishes editor approved content and manages overview, promotional features, and analytics.",
        permissions: [
            "VIEW", "READ",
            "FEATURE_AS_COLLAB",
            "MANAGE_MEMORIES", "MANAGE_COLLECTIONS",
            "VIEW_ANALYTICS",
            "MANAGE_PUBLICATIONS", "MANAGE_PROMOTIONS"
        ]
    },
    moderator: { 
        name: "Moderator",
        description: "Maintains brand standards by managing comments, user access, and automod rules.",
        permissions: [
            "VIEW", "READ",
            "AUDIT_ACCESS",
            "MANAGE_COMMENTS", "MANAGE_ACCESS", "MANAGE_AUTOMOD"
        ]
    },
    admin: {
        name: "Administrator",
        description: "Full control including backups and role management.",
        permissions: [
            "ADMIN"
        ]
    }
} satisfies Record<string, Role>;

interface Role {
    name: string;
    description: string;
    permissions: AssetPermissionName[];
}

export type AssetPermissionName = keyof typeof index;
export type AssetRoleName = keyof typeof roles;

interface RoleResult {
    name: string;
    description: string;
    value: string;
    array: AssetPermissionName[];
}

/**
 * Handles encoding, decoding, checking, and updating permission bitmasks.
 * Permissions are stored as bigint bit flags based on a central index map.
 */
export default class AssetPermissionsService {
    public static permissions = index;

    private static bit(permission: AssetPermissionName): bigint {
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
     * AssetPermissionsService.decode("1"); // ["VIEW"]
     */
    public static decode(input: string): AssetPermissionName[] {
        assertNotNull(input);

        if (!/^[0-9]+$/.test(input)) {
            assertNotNull(input);
        }

        const userPermissions = BigInt(input);
        const result: AssetPermissionName[] = [];

        if ((userPermissions & this.bit("ADMIN")) !== 0n) {
            return Object.keys(this.permissions) as AssetPermissionName[];
        }

        for (const [name, shift] of Object.entries(this.permissions)) {
            if ((userPermissions & (1n << shift)) !== 0n) {
                result.push(name as AssetPermissionName);
            }
        }

        return result;
    }

    /**
     * Encodes a list of permissions into a bigint string.
     *
     * @example
     * AssetPermissionsService.encode(["VIEW", "READ"]); // "3"
     */
    public static encode(input: AssetPermissionName[]): string {
        if (!input?.length) {
            assertNotNull(input);
        }

        let result = 0n;

        for (const permission of new Set(input)) {
            result |= this.bit(permission);
        }

        return result.toString();
    }

    /**
     * Checks whether a permission value satisfies required permissions array.
     *
     * @example
     * AssetPermissionsService.has("1", ["VIEW", "READ"]); // all (default)
     * AssetPermissionsService.has("1", ["VIEW", "READ"], "any");
     */
    public static has(
        input: string,
        compare: AssetPermissionName | AssetPermissionName[],
        mode: "all" | "any" = "all"
    ): boolean {
        const decoded = this.decode(input);

        const permissions = Array.isArray(compare)
            ? compare
            : [compare];

        if (decoded.includes("ADMIN")) {
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
     * AssetPermissionsService.getRole("robot"); // Not a valid role name
     * {
     *     name: "Robot",
     *     description: "Description not set.",
     *     value: "1",
     *     array: ["VIEW"]
     * }
     */
    public static getRole(input: AssetRoleName): RoleResult {
        const role = roles[input];

        if (!role) {
            throw new AdvancedError({
                code: 404,
                message: `Role "${input}" not found`
            })
        }

        return {
            name: role.name,
            description: role.description,
            value: this.encode(role.permissions),
            array: role.permissions,
        };
    }

    /**
     * Adds or removes permissions from an existing permission bitmask.
     *
     * @example
     * AssetPermissionsService.update("1", "READ", true);
     * AssetPermissionsService.update("3", ["VIEW", "READ"], false);
     */
    public static update(
        input: string | bigint,
        permission: AssetPermissionName | AssetPermissionName[],
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

    /**
     * Check if the current session can access or perform an action
     */
    public static can(
        userId: string,
        permissions: AssetPermissionName | AssetPermissionName[],
        assetId: string
    ) {
        assertNotNull([userId, permissions, assetId]);

        const assetType = whatIs(assetId)

        assertNotNull(assetType);

        // DEVELOPER NEEDED: Must check drafts, not pubished ones
        const asset: GetPublishedCharacterType | GetUserType | null = 
            assetType.type === "CHARACTER" ? getPublishedCharactersService({ id: assetId }) :
            // DEVELOPER NEEDED: Add collections and universes
            assetType.type === "USER" ? getUsersService({ id: assetId }) :
            null;

        assertNotNull(asset)
        
        const item = asset.items[0];

        assertNotNull(item)

        if (
            userId === item.id ||
            ("owner" in item && item.owner.id === userId)
        ) {
            return true;
        }

        const permissionsResult = db.users.query<PermissionsType>(
            "SELECT * FROM permissions WHERE userId = ? AND assetId = ?",
            [userId, assetId]
        );

        if (!permissionsResult.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching permissions",
                details: permissionsResult.error
            })
        }

        if (permissionsResult.rowCount > 0) {
            console.log(permissionsResult.rows[0])
            return this.has(
                permissionsResult.rows[0].permissions,
                permissions
            )
        }

        return false;
    }
}
