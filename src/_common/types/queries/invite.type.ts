export type InviteType = {
    ownerId: string;
    code: string;
    usesLeft: number;
    isUnlimited: boolean;
    isSuspended: boolean;
    createdDate: string;
    uses: number;
}