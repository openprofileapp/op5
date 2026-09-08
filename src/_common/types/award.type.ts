export type AwardNameType =
    | "CONTRIBUTOR"
    | "ENTOMOLOGIST"
    | "PRECURSOR"
;

export type AwardType = {
    id: string;
    type: AwardNameType;
    comment?: string;
    visibility: string;
    date: string;
};

export type GetAwardType = Omit<
    AwardType, 
    "id"
>;
