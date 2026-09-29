import { CategoryIdType } from "../../scripts/categories.js";
import { VisibilityType } from "../visibility.type.js";
import { GetRowType } from "./row.type.js";

export type BlockItemType = {
    blockId: string;
    ownerId?: string;
    categoryType: CategoryIdType;
    icon?: string;
    displayName?: string;
    about?: string;
    tags?: string;
    source: "official" | "community";
    isRecommended: boolean;
    isSensitive: boolean;
    isMature: boolean;
    uses: number;
    visibility: VisibilityType;
    updatedDate: string;
    createdDate: string;
    isDeleted: boolean;
    deletedDate: string;
}

export type GetBlockItemType = BlockItemType & {
    rows: GetRowType[];
};

export type GetBlockType = {
    items: GetBlockItemType[],
    count: number
}
