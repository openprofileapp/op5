import { CategoryIdType } from "../../scripts/categories.js";
import { GetTemplateRowType } from "./row.type.js";

export type TemplateBlockItemType = {
    templateId: string;
    blockId: string;
    categoryId: string;
    categoryType: CategoryIdType;
    sourceBlockId: string;
    isSourceBlockConnected: boolean;
    icon?: string;
    label?: string;
    description?: string;
    position: number;
    createdBy: string;
    updatedDate: string;
    createdDate: string;
}


export type GetTemplateBlockItemType = Omit<
    TemplateBlockItemType, 
    "templateId" | "categoryId"
> & {
    rows: GetTemplateRowType[];
};

export type GetTemplateBlockType = {
    items: GetTemplateBlockItemType[],
    count: number
}
