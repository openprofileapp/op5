export type TemplateValueType = {
    blockId: string;
    fieldId: string;
    author: string;
    content: string;
    date: string;
}

export type ValueType = {
    assetId: string;
    fieldId: string;
    author: string;
    content: string;
    date: string;
}

export type GetTemplateValueType = Omit<
    TemplateValueType, 
    "blockId" | "fieldId"
>

export type GetValueType = Omit<
    ValueType, 
    "assetId" | "fieldId"
>
