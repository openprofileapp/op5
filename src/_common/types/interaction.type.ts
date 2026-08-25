export type InteractionType = {
    source: string;
    target: string;
    date: string;
}

export type GetSourceInteractionType = Omit<
    InteractionType, 
    "source"
>;

export type GetTargetInteractionType = Omit<
    InteractionType, 
    "target"
>;

export type InteractionNameType = 
    | "blocks"
    | "chats"
    | "dismisses"
    | "follows"
    | "friends"
    | "hiddenCollaborations"
    | "hides"
    | "likes"
    | "mutes"
    | "reads"
    | "restricts"
    | "shares"
    | "views";

export type InteractionMethod = "source" | "target"

export type TransformedRow = GetSourceInteractionType | GetTargetInteractionType | InteractionType;

export type GetInteractionCollection<T = TransformedRow> = {
    items: T[];
    count: number;
    hasInteracted?: boolean;
};
