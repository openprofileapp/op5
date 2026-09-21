import { GetTemplateFieldType } from "./field.type.js";

export type TemplateRowItemType = {
    templateId: string;
    blockId: string;
    rowId: string;
    position: number;
    createdBy: string;
    createdDate: string;
}


export type GetTemplateRowItemType = Omit<
    TemplateRowItemType, 
     "templateId" | "blockId"
> & {
    fields: GetTemplateFieldType[];
};

export type GetTemplateRowType = {
    items: GetTemplateRowItemType[],
    count: number
}
