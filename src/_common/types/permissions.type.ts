export type PermissionsType = {
    userId: string;
    assetId: string;
    title: string;
    comment: string;
    permissions: string;
    addedBy: string;
    date: string;
}

export type GetPermissionType = Omit<
    PermissionsType, 
    "userId" | "assetId"
> & {
    isCollaborator: boolean;
};
