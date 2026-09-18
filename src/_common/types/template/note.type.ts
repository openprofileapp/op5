export type NoteType = {
    fieldId: string;
    authorId: string;
    text: string;
    position: number;
    isPinned: boolean;
    lastEditedDate: string;
    createdDate: string;
}

export type GetNoteType = Omit<
    NoteType, 
    "fieldId"
>
