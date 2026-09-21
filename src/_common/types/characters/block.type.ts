import { CategoryIdType } from "../../scripts/categories.js";
import { GetDraftCharacterRowType, GetPublishedCharacterRowType } from "./row.type.js";

export type PublishedCharacterBlockItemType = {
    assetId: string;
    blockId: string;
    categoryId: string;
    icon?: string;
    label?: string;
    description?: string;
    position: number;
}

export type DraftCharacterBlockItemType = {
    assetId: string;
    blockId: string;
    categoryId: string;
    categoryType: CategoryIdType;
    sourceBlockId: string;
    isSourceBlockConnected: boolean;
    icon?: string;
    label?: string;
    description?: string;
    position: number;
    createdBy: string;
    updatedDate: string;
    createdDate: string;
}

export type GetPublishedCharacterBlockItemType = Omit<
    PublishedCharacterBlockItemType, 
    "assetId" | "categoryId"
> & {
    rows: GetPublishedCharacterRowType[];
};

export type GetDraftCharacterBlockItemType = Omit<
    DraftCharacterBlockItemType, 
    "assetId" | "categoryId"
> & {
    rows: GetDraftCharacterRowType[];
};

export type GetPublishedCharacterBlockType = {
    items: GetPublishedCharacterBlockItemType[],
    count: number
}

export type GetDraftCharacterBlockType = {
    items: GetDraftCharacterBlockItemType[],
    count: number
}
