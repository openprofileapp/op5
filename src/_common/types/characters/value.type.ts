export type PublishedCharacterValueType = {
    assetId: string;
    fieldId: string;
    content: string;
}

export type DraftCharacterValueType = {
    assetId: string;
    fieldId: string;
    authorId: string;
    content: string;
    date: string;
}

export type GetPublishedCharacterValueType = Omit<
    PublishedCharacterValueType, 
    "assetId"
>

export type GetDraftCharacterValueType = Omit<
    DraftCharacterValueType, 
    "assetId"
>
