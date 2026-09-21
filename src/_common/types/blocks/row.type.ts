import { GetFieldType } from "./field.type.js";

export type RowItemType = {
    blockId: string;
    rowId: string;
    position: number;
    createdBy: string;
    createdDate: string;
}

export type GetRowItemType = Omit<
    RowItemType, 
     "blockId" | "rowId"
> & {
    fields: GetFieldType[];
};

export type GetRowType = {
    items: GetFieldType[],
    count: number
}
