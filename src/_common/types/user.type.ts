import { GetBadgeType } from "./badge.type.js";
import { InteractionCollection, InteractionNameType } from "./interaction.type.js";
import { GetLinkType } from "./link.type.js";

export type UserType = {
    algorithmScore: string;
    id: string;
    username: string;
    usernameOld: string;
    usernameOldExpire: string;
    displayName?: string;
    fanflair: string;
    avatar?: string;
    banner?: string;
    status?: string;
    about?: string;
    tags: string;
    pronouns?: string;
    birthdate?: string;
    birthdateVisibility: string;
    foundedDate?: string;
    foundedDateVisibility: string;
    theme: string;
    isAuraEnabled: boolean;
    auraType: string;
    auraPrimary: string;
    auraSecondary: string;
    type: string;
    isExplicit: boolean;
    visibility: string;
    sendMessages: string;
    sendComments: string;
    presence: string;
    presenceVisibility: string;
    lastActive: string;
    createdDate: string;
}

export type GetUserType = Omit<
    UserType, 
    "ownerId" | 
    "tags"
> & {
    tags: string[];
    badges: GetBadgeType[];
    links: GetLinkType[];
    interactions: Partial<Record<InteractionNameType, InteractionCollection>>;
};
