export type MediaType = {
    assetId: string;
    url: string;
    description: string;
    credit: string;
    position: string;
    visibility: string;
    addedBy: string;
    date: string;
}

export type GetMediaType = Omit<
    MediaType, 
    "assetId"
>
