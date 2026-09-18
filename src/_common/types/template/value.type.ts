export type TemplateValueType = {
    blockId: string;
    fieldId: string;
    authorId: string;
    content: string;
    date: string;
}

export type ValueType = {
    assetId: string;
    fieldId: string;
    authorId: string;
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
