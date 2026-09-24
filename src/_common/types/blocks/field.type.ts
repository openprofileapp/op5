import { FieldNameType, FieldOptionsType } from "../field.type.js";
import { GetValueType } from "./value.type.js";

export type FieldItemType = {
    blockId: string;
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

export type GetFieldItemType = Omit<
    FieldItemType, 
    "blockId" | "rowId" | "fieldId"
> & {
    value?: GetValueType;
};

export type GetFieldType = {
    items: GetFieldItemType[],
    count: number
}
