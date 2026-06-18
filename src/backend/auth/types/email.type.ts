export type EmailType = {
    userId: string;
    email: string;
    isVerified: boolean;
    isMfa: boolean;
    isSubscribedToNewsletters: boolean;
    isSubscribedToAccountNotifications: boolean;
    isSubscribedToPromotionalMaterial: boolean;
}