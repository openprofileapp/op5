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
    | "separator"
;

export type FieldOptionsType = {
    dataset?: string;
    valueFormat?: Record<number, string>;
    icon?: "star" | "heart";
    maxRating?: number;
    separator?: "spacer" | "divider" | "header";
    typeable?: boolean;
    multiselect?: boolean;
}
