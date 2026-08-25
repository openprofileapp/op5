import { GetBadgeType } from "./badge.type.js";
import { GetInteractionCollection, InteractionNameType } from "./interaction.type.js";
import { GetLinkType } from "./link.type.js";
import { OwnerType } from "./owner.type.js";
import { VisibilityType } from "./visibility.type.js";

export type PublishedCharacterType = {
    algorithmScore: number;
    id: string;
    ownerId: string;
    slug?: string;
    displayName?: string;
    avatar?: string;
    animatedAvatar?: string;
    banner?: string;
    about?: string;
    tags: string;
    licenseId: string;
    isAuraEnabled: boolean;
    auraType: string;
    auraPrimary: string;
    auraSecondary: string;
    isExplicit: boolean;
    visibility: VisibilityType;
    readVisibility: VisibilityType;
    sendComments: string;
    isScheduled: boolean;
    updatedDate: string;
    createdDate: string;
}

export type GetPublishedCharacterType = Omit<
    PublishedCharacterType, 
    "ownerId" | 
    "tags"
> & {
    owner: OwnerType;
    tags: string[];
    badges: GetBadgeType[];
    links?: GetLinkType[];
    interactions?: Partial<Record<InteractionNameType, GetInteractionCollection>>;
    isPinned?: boolean;
};

// DEVELOPER NEEDED: Add DraftCharacterType here
