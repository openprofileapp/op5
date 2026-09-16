import { GetFieldType } from "./field.type.js";

export type RowType = {
    assetId: string;
    rowId: string;
    blockId: string;
    position: number;
    createdBy: string;
    createdDate: string;
}

export type GetRowType = Omit<
    RowType, 
    "assetId" | "blockId"
> & {
    fields: GetFieldType[];
};
