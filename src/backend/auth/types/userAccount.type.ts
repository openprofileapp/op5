export type UserAccountType = {
    id: string;
    hasEmail: boolean;
    hasPhoneNumber: boolean;
    password: string;
    birthDate: string;
    isMfaEnabled: boolean;
    totpSecret: string;
    permissions: string;
    locale: string;
    timezone: string;
    initialIp: string;
    hasReadTerms: boolean;
    lastReadTermsVersion: string;
    hasCompletedOnboarding: boolean;
    lastActive: string;
    isSuspended: boolean;
    isDeleted: boolean;
    createdDate: string;
}
