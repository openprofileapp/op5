import { CategoryIdType } from "../../scripts/categories.js";
import { GetDraftCharacterBlockType, GetPublishedCharacterBlockType } from "./block.type.js";

export type PublishedCharacterCategoryItemType = {
    assetId: string;
    categoryId: string;
    label?: string;
    position: number;
}

export type DraftCharacterCategoryItemType = {
    assetId: string;
    categoryId: string;
    types: CategoryIdType[];
    label?: string;
    position: number;
    createdBy: string;
    updatedDate: string;
    createdDate: string;
}

export type GetPublishedCharacterCategoryItemType = Omit<
    PublishedCharacterCategoryItemType, 
    "assetId"
> & {
    blocks: GetPublishedCharacterBlockType;
};

export type GetDraftCharacterCategoryItemType = Omit<
    DraftCharacterCategoryItemType, 
    "assetId"
> & {
    blocks: GetDraftCharacterBlockType;
};

export type GetPublishedCharacterCategoryType = {
    items: GetPublishedCharacterCategoryItemType[],
    count: number
}

export type GetDraftCharacterCategoryType = {
    items: GetDraftCharacterCategoryItemType[],
    count: number
}
