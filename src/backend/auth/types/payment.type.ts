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
    amount: number;
    currency: string;
    status: PaymentStatusType;
    date: string;
}
