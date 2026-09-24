export type FieldNameType = 
    | "text"
    | "dropdown"
    | "slider"
    | "color"
    | "rating"
    | "asset"
    | "button"
    | "media"
    | "timeline"
    | "calendar"
    | "table"
    | "spacer"
;

export type FieldOptionsType = {
    dataset: string;
    min: number;
    max: number;
    marks: number;
    icon: "star" | "heart";
    spacer: "blank" | "line";
}
