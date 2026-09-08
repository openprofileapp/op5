export type BadgeNameType =
    | "OFFICIAL"
    | "PARTNER"
    | "PREMIUM"
    | "PROMOTED"
    | "STAFF"
    | "UNOFFICIAL"
    | "VERIFIED"
    | "LIMITED"
;

export type BadgeType = {
    id: string;
    type: BadgeNameType;
    comment?: string;
    visibility: string;
    date: string;
};

export type GetBadgeType = Omit<
    BadgeType, 
    "id"
>;
