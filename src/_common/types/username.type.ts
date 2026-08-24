export type UsernameType = {
    userId: string;
    username: string;
    isPrimary: boolean;
    addedDate: string;
}

export type GetUsernameType = Omit<
    UsernameType, 
    "userId"
>;
