export type InterestItemType = {
    userId: string;
    tag: string;
    algorithmScore: number
}

export type InterestType = {
    items: InterestItemType[];
    count: number
}
