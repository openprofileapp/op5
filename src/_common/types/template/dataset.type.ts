import { DropdownOptionsType } from "../dropdown.type.js";
import { VisibilityType } from "../visibility.type.js";

export type DatasetItemType = {
    id: string;
    ownerId: string;
    label?: string;
    description?: string;
    data: DropdownOptionsType;
    source: "official" | "community";
    uses: number;
    visibility: VisibilityType;
    updatedDate: string;
    createdDate: string;
}

export type GetDatasetsType = {
    items: DatasetItemType[],
    count: number
}
