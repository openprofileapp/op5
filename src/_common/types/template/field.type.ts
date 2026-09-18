import { DropdownOptionsType } from "../dropdown.type.js";
import { GetNoteType } from "./note.type.js";
import { GetThoughtType } from "./thought.type.js";
import { GetValueType } from "./value.type.js";

export type FieldNameType = 
    | "text"
    | "dropdown"
    | "slider"
    | "color"
    | "rating"
    | "asset"
    | "button"
    | "media"
    | "timeline"
    | "calendar"
    | "table"
    | "spacer"
;

export type TemplateFieldItemType = {
    blockId: string;
    fieldId: string;
    rowId: string;
    type: FieldNameType;
    label?: string;
    placeholder?: string;
    options?: DropdownOptionsType;
    guide?: string;
    isLocked: boolean;
    position: number;
    createdBy: string;
    createdDate: string;
}

export type FieldItemType = {
    assetId: string;
    fieldId: string;
    rowId: string;
    type: FieldNameType;
    label?: string;
    placeholder?: string;
    options?: DropdownOptionsType;
    guide?: string;
    isLocked: boolean;
    position: number;
    createdBy: string;
    lastEditedDate: string;
    createdDate: string;
}

export type GetTemplateFieldItemType = Omit<
    TemplateFieldItemType, 
    "blockId" | "FieldId"
> & {
    value?: GetValueType;
    notes: GetNoteType[];
    thoughts?: GetThoughtType;
};

export type GetFieldItemType = Omit<
    FieldItemType, 
    "assetId" | "FieldId"
> & {
    value?: GetValueType;
    notes: GetNoteType[];
    thoughts?: GetThoughtType;
};

export type GetFieldType = {
    items: GetFieldItemType[],
    count: number
}
