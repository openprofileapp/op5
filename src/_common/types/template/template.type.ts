import { OwnerType } from "../owner.type.js";

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
    owner: OwnerType;
};

export type GetTemplateType = {
    items: GetTemplateItemType[],
    count: number
}
