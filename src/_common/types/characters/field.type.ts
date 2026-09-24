import { FieldNameType, FieldOptionsType } from "../field.type.js";
import { GetDraftCharacterValueType, GetPublishedCharacterValueType } from "./value.type.js";

export type PublishedCharacterFieldItemType = {
    assetId: string;
    rowId: string;
    fieldId: string;
    flex: number;
    type: FieldNameType;
    label?: string;
    position: number;
}

export type DraftCharacterFieldItemType = {
    assetId: string;
    rowId: string;
    fieldId: string;
    flex: number;
    type: FieldNameType;
    label?: string;
    placeholder?: string;
    options?: FieldOptionsType;
    guide?: string;
    isLocked: boolean;
    position: number;
    createdBy: string;
    updatedDate: string;
    createdDate: string;
}

export type GetPublishedCharacterFieldItemType = Omit<
    PublishedCharacterFieldItemType, 
    "assetId" | "rowId"
> & {
    value?: GetPublishedCharacterValueType;
};

export type GetDraftCharacterFieldItemType = Omit<
    DraftCharacterFieldItemType, 
    "assetId" | "rowId"
> & {
    value?: GetDraftCharacterValueType;
};

export type GetPublishedCharacterFieldType = {
    items: GetPublishedCharacterFieldItemType[],
    count: number
}

export type GetDraftCharacterFieldType = {
    items: GetDraftCharacterFieldItemType[],
    count: number
}
