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
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    status: PaymentStatusType;
    dateCreated: string;
}
