import { CategoryIdType } from "../../scripts/categories.js";
import { VisibilityType } from "../visibility.type.js";
import { GetRowType } from "./row.type.js";

export type TemplateBlockItemType = {
    blockId: string;
    ownerId: string;
    categoryType: CategoryIdType;
    icon?: string;
    label?: string;
    description?: string;
    tags?: string;
    source: "official" | "community";
    isRecommended: boolean;
    isSensitive: boolean;
    isMature: boolean;
    uses: number;
    visibility: VisibilityType;
    updatedDate: string;
    createdDate: string;
}

export type BlockItemType = Omit<
    TemplateBlockItemType,
    | "ownerId"
    | "categoryType"
    | "tags"
    | "source"
    | "isRecommended"
    | "isSensitive"
    | "isMature"
    | "uses"
    | "visibility"
    | "updatedDate"
> & {
    assetId: string;
    sourceBlockId?: string;
    isSourceBlockConnected?: boolean;
    categoryId: string;
    position: number;
    createdBy: string;
    lastEditedDate: string;
};

export type GetBlockItemType = Omit<
    BlockItemType, 
    "assetId" | "categoryId"
> & {
    rows: GetRowType[];
};

export type GetTemplateBlockType = {
    items: TemplateBlockItemType[],
    count: number
}

export type GetBlockType = {
    items: GetBlockItemType[],
    count: number
}
