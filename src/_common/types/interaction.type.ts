export type InteractionType = {
    source: string;
    target: string;
    date: string;
}

export type InteractionNameType = 
    | "blocks"
    | "chats"
    | "dismisses"
    | "follows"
    | "friends"
    | "hiddenCollaborations"
    | "hides"
    | "likes"
    | "reads"
    | "restricts"
    | "shares"
    | "views"
;

export type InteractionMethod = "source" | "target"

export type GetInteractionsResult = {
    items: InteractionType[];
    randomItem: InteractionType;
    count: number;
    latestDate: string;
    hasInteracted?: boolean;
};

export type GetInteractionCollection = Partial<
    Record<InteractionNameType, GetInteractionsResult>>;
