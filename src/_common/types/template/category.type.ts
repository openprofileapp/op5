import { CategoryIdType } from "../../scripts/categories.js";
import { GetBlockType } from "./block.type.js";

export type CategoryType = {
    assetId: string;
    categoryId: string;
    types: CategoryIdType[];
    label?: string;
    position: number;
    createdBy: string;
    lastEditedDate: string;
    createdDate: string;
}

export type GetCategoryType = Omit<
    CategoryType, 
    "assetId"
> & {
    blocks: GetBlockType[];
};
