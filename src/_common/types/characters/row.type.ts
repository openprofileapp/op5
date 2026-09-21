import { GetDraftCharacterFieldType, GetPublishedCharacterFieldType } from "./field.type.js";

export type PublishedCharacterRowItemType = {
    assetId: string;
    blockId: string;
    rowId: string;
    position: number;
}

export type DraftCharacterRowItemType = {
    assetId: string;
    blockId: string;
    rowId: string;
    position: number;
    createdBy: string;
    createdDate: string;
}

export type GetPublishedCharacterRowItemType = Omit<
    PublishedCharacterRowItemType, 
     "assetId" | "blockId"
> & {
    fields: GetPublishedCharacterFieldType[];
};

export type GetDraftCharacterRowItemType = Omit<
    DraftCharacterRowItemType, 
     "assetId" | "blockId"
> & {
    fields: GetDraftCharacterFieldType[];
};

export type GetPublishedCharacterRowType = {
    items: GetPublishedCharacterFieldType[],
    count: number
}

export type GetDraftCharacterRowType = {
    items: GetDraftCharacterFieldType[],
    count: number
}
