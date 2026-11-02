export type PaymentStatusType =
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED"
;

export type PaymentType = {
    id: string;
    subscriptionId: string;
    userId: string;
    email?: string;
    subtotal: number;
    tax: number;
    total: number;
    partnerSplit: number;
    currency: string;
    status: PaymentStatusType;
    dateCreated: string;
}
