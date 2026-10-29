export type SubscriptionStatusType =
    | "PENDING"
    | "ACTIVE"
    | "SUSPENDED"
    | "CANCELED"
    | "EXPIRED"
;

export type SubscriptionPlanType =
    | "PREMIUM_MONTHLY"
    | "PREMIUM_LIFETIME"
;

export type SubscriptionMethodType =
    | "OFFICIAL_GIFT"
    | "PARTNER_GIFT"
    | "PRECURSOR_GIFT"
    | "PAYPAL"
;

export type SubscriptionType = {
    id: string;
    userId: string;
    plan: SubscriptionPlanType;
    method: SubscriptionMethodType;
    status: SubscriptionStatusType;
    endReason: string;
    dateCreated: string;
    dateStarted: string;
    dateEnded: string;
}
