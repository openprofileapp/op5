import { AssetNameType } from "./asset.type.js";

export type WhatIsType = {
    id: string;
    ownerId?: string;
    displayName?: string;
    primaryUsername?: string;
    avatar?: string;
    isAuraEnabled?: boolean;
    auraType?: string;
    auraPrimary?: string;
    auraSecondary?: string;
    type: AssetNameType;
    tags: string[];
    createdDate: string;
    updatedDate?: string;
    isPremium: boolean;
    isVerified: boolean;
    isPromoted: boolean;
    isOfficial: boolean;
}
