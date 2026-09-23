import { WhatIsType } from "../whatIs.type.js";

export type TemplateType = {
    id: string;
    ownerId: string;
    displayName?: string;
    about?: string;
    source?: "official" | "community";
    uses?: number;
    updatedDate: string;
    createdDate: string;
    isDeleted: boolean;
    deletedDate: string;
}

export type GetTemplateItemType = Omit<
    TemplateType, 
    "ownerId"
> & {
    owner: WhatIsType;
};

export type GetTemplateType = {
    items: GetTemplateItemType[],
    count: number
}
