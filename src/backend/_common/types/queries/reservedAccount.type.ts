export type ReservedAccountType = {
    username: string;
    email: string;
    phoneNumber: string;
    isVerified: boolean;
    isPartner: boolean;
    isLifetimePremium: boolean;
    reason: string;
    reservedBy: string;
    dateReserved: string;
}