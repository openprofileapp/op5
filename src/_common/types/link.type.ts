export type LinkType = {
    assetId: string;
    url: string;
    label: string;
    previewText: string | null;
    visibility: string;
    position: number;
    date: string;
};

export type GetLinkType = Omit<
    LinkType, 
    "assetId"
>;
