export type ValueType = {
    blockId: string;
    fieldId: string;
    authorId: string;
    content: string;
    date: string;
}

export type GetValueType = Omit<
    ValueType, 
    "blockId" | "fieldId"
>
