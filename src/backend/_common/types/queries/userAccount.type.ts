export type UserAccount = {
    id: string;
    hasEmail: boolean;
    hasPhoneNumber: boolean;
    password: string;
    birthdate: string;
    mfaSecret: string;
    permissions: string;
    locale: string;
    timezone: string;
    earnedRevenueUSD: number;
    hasReadTerms: boolean;
    lastActive: string;
    isSuspended: boolean;
    isDeleted: boolean;
    createdDate: string;
}
