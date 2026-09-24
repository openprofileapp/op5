import { FieldNameType, FieldOptionsType } from "../field.type.js";
import { GetTemplateValueType } from "./value.type.js";

export type TemplateFieldItemType = {
    templateId: string;
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

export type GetTemplateFieldItemType = Omit<
    TemplateFieldItemType, 
    "templateId" | "rowId"
> & {
    value?: GetTemplateValueType;
};

export type GetTemplateFieldType = {
    items: GetTemplateFieldItemType[],
    count: number
}
