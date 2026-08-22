export type BadgeType = {
    id: string;
    type: string;
    comment?: string;
    visibility: string;
    date: string;
};

export type GetBadgeType = Omit<
    BadgeType, 
    "id"
>;
