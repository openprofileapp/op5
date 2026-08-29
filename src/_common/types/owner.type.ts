import { GetBadgeType } from "./badge.type.js";

export type OwnerType = {
    id: string;
    username: string;
    displayName?: string;
    badges: GetBadgeType[];
    type: string;
}
