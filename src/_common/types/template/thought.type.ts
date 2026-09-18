export type ThoughtType = {
    fieldId: string;
    authorId: string;
    text: string;
    lastEditedDate: string;
    createdDate: string;
}

export type GetThoughtType = Omit<
    ThoughtType, 
    "fieldId"
>
