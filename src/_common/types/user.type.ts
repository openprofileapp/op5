import { GetBadgeType } from "./badge.type.js";
import { GetInteractionCollection } from "./interaction.type.js";
import { GetLinkType } from "./link.type.js";
import { GetUsernameType } from "./username.type.js";
import { VisibilityType } from "./visibility.type.js";

export type UserType = {
    algorithmScore: string;
    id: string;
    displayName?: string;
    fanflair: string;
    avatar?: string;
    banner?: string;
    status?: string;
    about?: string;
    tags: string;
    pronouns?: string;
    birthdate?: string;
    birthdateVisibility: VisibilityType;
    foundedDate?: string;
    foundedDateVisibility: VisibilityType;
    theme: string;
    isAuraEnabled: boolean;
    auraType: string;
    auraPrimary: string;
    auraSecondary: string;
    type: string;
    isDeveloper: boolean;
    isExplicit: boolean;
    visibility: VisibilityType;
    sendMessages: string;
    sendComments: string;
    presence: string;
    presenceVisibility: VisibilityType;
    lastActive: string;
    createdDate: string;
}

export type GetUserItemType = Omit<
    UserType, 
    "tags"
> & {
    tags: string[];
    usernames: GetUsernameType[];
    badges: GetBadgeType[];
    links?: GetLinkType[];
    interactions?: Partial<GetInteractionCollection>;
};

export type GetUserType = {
    items: GetUserItemType[],
    count: number
}
