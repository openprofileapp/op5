import { GetBadgeType } from "./badge.type.js";
import { GetInteractionCollection } from "./interaction.type.js";
import { GetLinkType } from "./link.type.js";
import { OwnerType } from "./owner.type.js";
import { VisibilityType } from "./visibility.type.js";

export type CollectionType = {
    algorithmScore: number;
    id: string;
    ownerId: string;
    displayName: string;
    avatar: string;
    about: string;
    tags: string;
    isFavorites: boolean;
    isMature: boolean;
    visibility: VisibilityType;
    updatedDate: string;
    createdDate: string;
    isDeleted: string;
    deletedDate: string;
};

export type CollectionItemType = {
    collectionId: string;
    assetId: string;
    addedBy: string;
    date: string;
};

export type GetCollectionItemType = Omit<
    CollectionType, 
    "tags"
> & {
    owner: OwnerType;
    tags: string[];
    badges: GetBadgeType[];
    links?: GetLinkType[];
    interactions?: Partial<GetInteractionCollection>;
    items?: CollectionItemType[];
    isPinned?: boolean;
    isItemInCollection?: boolean;
};

export type GetCollectionType = {
    items: GetCollectionItemType[],
    count: number
}
