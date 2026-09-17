import { GetFieldType } from "./field.type.js";

export type TemplateRowItemType = {
    rowId: string;
    blockId: string;
    position: number;
    createdBy: string;
    createdDate: string;
}

export type RowItemType = {
    assetId: string;
    rowId: string;
    blockId: string;
    position: number;
    createdBy: string;
    createdDate: string;
}
export type GetTemplateRowItemType = Omit<
    TemplateRowItemType, 
    "blockId"
> & {
    fields: GetFieldType[];
};

export type GetRowItemType = Omit<
    RowItemType, 
    "assetId" | "blockId"
> & {
    fields: GetFieldType[];
};

export type GetRowType = {
    items: RowItemType[],
    count: number
}
