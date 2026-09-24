import { ValueOptionsType } from "../value.type.js";

export type TemplateValueType = {
    templateId: string;
    fieldId: string;
    authorId: string;
    content: string;
    options?: ValueOptionsType;
    date: string;
}

export type GetTemplateValueType = Omit<
    TemplateValueType, 
    "templateId"
>
