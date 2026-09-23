import { CategoryIdType } from "../../scripts/categories.js";
import { GetTemplateBlockType } from "./block.type.js";

export type TemplateCategoryItemType = {
    templateId: string;
    categoryId: string;
    types: CategoryIdType[];
    label?: string;
    position: number;
    createdBy: string;
    updatedDate: string;
    createdDate: string;
}

export type GetTemplateCategoryItemType = Omit<
    TemplateCategoryItemType, 
    "templateId"
> & {
    blocks: GetTemplateBlockType;
};

export type GetTemplateCategoryType = {
    items: GetTemplateCategoryItemType[],
    count: number
}
