export type PlatformPermissionNameType =
    | "VIEW"
    | "READ"
    | "WRITE"
    | "USE_INTERACTIONS"
    | "USE_SOCIAL_FEATURES"
    | "CREATE_REPORTS"
    | "CREATE_ASSETS"
    | "CREATE_BOTS"
    | "PREMIUM_ACCESS"
    | "BYPASS_EXTERNAL_ADS"
    | "USE_CUSTOM_THEMES"
    | "VERIFIED_ACCESS"
    | "UPLOAD_MEMORIES"
    | "EARN_REVENUE"
    | "CASHOUT_REVENUE"
    | "PARTNER_ACCESS"
    | "TOGGLE_EXPERIMENTS"
    | "BYPASS_CONNECTION_LIMIT"
    | "VIEW_ANALYTICS"
    | "VIEW_REVENUE"
    | "AUDIT_ACCESS"
    | "REVIEW_TICKETS"
    | "MANAGE_SUBSCRIPTIONS"
    | "TERMINATE_SESSIONS"
    | "REVIEW_REPORTS"
    | "REVIEW_APPEALS"
    | "MANAGE_VISIBILITY"
    | "REQUEST_CHANGES"
    | "MODERATE_ACCOUNTS"
    | "SUSPEND_ACCOUNTS"
    | "MANAGE_ACCESS"
    | "MANAGE_AUTOMOD"
    | "MANAGE_ASSETS"
    | "MANAGE_BOTS"
    | "MANAGE_ACCOUNTS"
    | "TRANSFER_OWNERSHIP"
    | "VERIFY_ACCOUNT"
    | "PROMOTE_ASSET"
    | "MANAGE_PARTNERS"
    | "MANAGE_SUPPORT_AGENTS"
    | "MANAGE_MODERATORS"
    | "ADMIN"
    | "SUPER_ADMIN"
;

export type PermissionsType = {
    userId: string;
    assetId: string;
    title: string;
    comment: string;
    permissions: string;
    addedBy: string;
    date: string;
}

export type GetPermissionType = Omit<
    PermissionsType, 
    "userId" | "assetId"
> & {
    isCollaborator: boolean;
};
