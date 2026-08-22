type BadgeType = {
    type: string;
    comment: string | null;
    visibility: string;
    date: string;
};

export type OwnerType = {
    id: string;
    username: string;
    displayName: string;
    badges: BadgeType[];
    type: string;
}

export type getPublishedCharacterType = {
    id: string;
    owner: OwnerType;
    slug: string;
    displayName: string;
    avatar: string;
    animatedAvatar: string;
    banner: string;
    about: string;
    tags: string;
    licenseId: string;
    isAuraEnabled: boolean;
    auraType: string;
    auraPrimary: string;
    auraSecondary: string;
    isExplicit: boolean;
    visibility: string;
    sendComments: string;
    isScheduled: boolean;
    updatedDate: string;
    createdDate: string;
    badges: BadgeType[];
}
