export type BadgeNameType =
    | "CONTRIBUTOR"
    | "ENTOMOLOGIST"
    | "OFFICIAL"
    | "PARTNER"
    | "PRECURSOR"
    | "PREMIUM"
    | "PROMOTED"
    | "STAFF"
    | "UNOFFICIAL"
    | "VERIFIED"
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
