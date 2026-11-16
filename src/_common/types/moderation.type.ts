import { PlatformPermissionNameType } from "./permissions.type.js";

export type ModerationReasonNameType =
    | "ABUSIVE_BEHAVIOR"
    | "SPAM_CONTENT"
    | "MALICIOUS_CONTENT"
    | "EXPLICIT_CONTENT"
    | "MISSING_MATURE_WARNING"
    | "MISSING_SENSITIVE_WARNING"
    | "DMCA_TAKEDOWN"
    | "PLATFORM_MISUSE"
    | "PLATFORM_MANIPULATION"
    | "BAN_EVASION"
    | "PRIVACY_VIOLATION"
    | "IMPERSONATION"
    | "AI_GENERATED_CONTENT"
    | "ILLEGAL_CONTENT"
    | "FILTER_BYPASS"
    | "CHARGEBACK"
;

export type ModerationStatusType =
    | "ACTIVE"
    | "EXPIRED"
    | "REVERSED"
;

export type ModerationReasonType = {
    name: string;
    description: string;
    severity:
        | "MINOR"
        | "MODERATE"
        | "SEVERE"
    ;
}

export type ModerationActionType = {
    account?: {
        type?: 
            | "notice" 
            | "warn" 
            | "suspend"
        ;
        duration?: number;
        visibility?: 
            | "hide" 
            | "unhide"
            | "add_sensitive_warning" 
            | "add_mature_warning"
        ;
        revokePermissions?: PlatformPermissionNameType[];
        revokePermissionsDuration?: number;
    };
    asset?: {
        visibility?: 
            | "hide" 
            | "unhide" 
            | "hide_all" 
            | "unhide_all" 
            | "add_sensitive_warning" 
            | "add_mature_warning"
        ;
    };
}

export type ModerationType = {
    id: string;
    accountId: string;
    assetId: string;
    action: string;
    accountVisibility?: string;
    assetVisibility?: string;
    type: string;
    moderatorNote?: string;
    moderatorId: string;
    duration: number;
    revokedPermissions: string;
    revokedPermissionsDuration: number;
    status: ModerationStatusType;
    createdDate: string;
    revokedById?: string;
    revokedReason?: string;
    revokedDate?: string;
}
