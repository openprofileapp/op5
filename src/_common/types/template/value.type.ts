export type ValueType = {
    assetId: string;
    fieldId: string;
    author: string;
    content: string;
    date: string;
}

export type GetValueType = Omit<
    ValueType, 
    "assetId" | "fieldId"
>
